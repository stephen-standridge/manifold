import { Map, fromJS } from 'immutable';
import { setAction } from '../../sauce/actions';

import { Behavior } from '../../sauce/behaviors'
import { ARRAY_TYPES } from '../../core/constants.js'

function makeData(context, config, name) {
	let arrayData = config.array;
	if (arrayData) return arrayData;
	// takes config.array or config.generator() returning an array
	// prefers config.generator()
	// config.generator is called with the current context
	let generator = config.generator;
	generator && delete config.generator;
	let generatedData = typeof generator == 'function' ? generator.call(context, context.properties, config) : false;
	if (generatedData && generatedData.constructor == Array) return generatedData;
	if (generatedData && generatedData[name]) return generatedData[name];
}

function make(context, config, name) {
	if (config.get) { config = config.toJS(); }
	let arrayOfType, data, value, attribute;

	arrayOfType = ARRAY_TYPES[config.type || 'Float32Array'];
	data = makeData(context, config, name);
	value = new arrayOfType(data);
	attribute = new three.BufferAttribute(value, config.itemSize);
	attribute.dynamic = config.dynamic || true;

	return attribute;
}

function initialize(context, config, setter) {
	if (!config || !config.get) return;
	let configuration = config.get('attributes');
	if (!configuration) return;

	// behaviors don't have geometry
	let geometry = context.geometry || context;
	let notBufferGeometry = (!geometry || geometry.type !== "BufferGeometry");
	if (notBufferGeometry && context.constructor !== Behavior) {
		console.warn('cannot attach attributes to three geometry', context);
	}
	if (configuration.get('generator')) {
		let generated = configuration.get('generator').call(context, config, context.properties);
		configuration = configuration.delete('generator');
		configuration = configuration.merge(generated);
	}

	let attributes = configuration.map((attributeConfig, name) => {
		let attribute = make(context, attributeConfig, name)
		if (setter) setter(attribute, name);
		else assign(context, attribute, name);
		setAction(context, `update_${name}`, makeUpdate(name));
	});

	return context;
}

function assign(context, attribute, name) {
	let geometry = context.geometry || context;
	if (name == 'index') {
		geometry.setIndex(attribute)
		geometry.getIndex().needsUpdate = true;
		return
	}
	if (geometry.getAttribute(name)) {
		geometry.getAttribute(name).set(attribute)
		geometry.getAttribute(name).needsUpdate = true;
		return
	}
	geometry.addAttribute(name, attribute)
	geometry.getAttribute(name).needsUpdate = true;
}

function makeUpdate(name) {
	return function (delta) {
		let geometry = this.geometry || this;
		geometry.attributes[name].setArray(delta(geometry.attributes[name].array));
		geometry.attributes[name].needsUpdate = true;
	}
}

export { initialize }
