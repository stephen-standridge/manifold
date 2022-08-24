import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../events/subscriptions';
import { getSource } from '../core/initializers';
import { setProperties } from '../webgl/data/properties';
import { initialize as initializeUniforms } from '../webgl/data/uniforms';
import { setTextures } from '../webgl/data/textures';
import { initialize as initializeAttributes } from '../webgl/data/attributes';
import { initialize as initializeCycles, unload as unloadCycles } from './cycles';
import { initialize as initializeActions, unload as unloadActions, setAction } from './actions';
import { prepareObject } from '../utils';
import { forEach } from 'lodash'
import { Map } from 'immutable'
import * as store from '../core/store';


export class Behavior {
	constructor(core, name) {
		this.core = core.get('aspects');
		this.name = name;
		this.registrations = {};
	}
	activate() {

		this.core = this.core.map((aspectConfig, aspectName, initializer) => {
			//iterates over each aspect within the given file
			return this.makeAspect(aspectConfig, aspectName, initializer);
		})
	}
	register(address, callback) {
		this.registrations[address.join(':')] = this.registrations[address.join(':')] || [];
		this.registrations[address.join(':')].push(callback);
	}
	distribute(context, aspectConfig, type) {
		aspectConfig.map((aspectSetters, aspectName) => {
			let setters = aspectSetters.toJS();
			let aspect = this[aspectName];
			let data = aspectName == type ? this[type] : aspect[type];
			if (!aspect) { console.warn(`could not find ${this.name}:${this.type}`); return }
			if (!data || !data.values) return;

			Object.keys(data.values).forEach((dataName) => {
				if (!data.values[dataName]) return;
				if (typeof setters[type] == 'function') {
					//if the behavior setters only specifies a general setter (one for attributes, uniforms, etc)
					this.register([aspectName, type, dataName], setters[type].bind(context));
					setters[type].call(context, data.values[dataName], dataName);
				} else if (setters[type] && setters[type][dataName]) {
					//if the behavior setters specifies a data-specific setter (a named attribute or uniform)
					this.register([aspectName, type, dataName], setters[type][dataName].bind(context));
					setters[type][dataName].call(context, data.values[dataName], dataName);
				}
			})
		})
	}
	makeAspect(aspectConfig, aspectName, initializer) {
		this[aspectName] = this[aspectName] || {};
		this[aspectName]['source'] = this[aspectName]['source'] || {};

		setProperties(this, aspectConfig, this.makeBehaviorAssigner('properties', aspectName));
		initializeAttributes(this, aspectConfig, this.makeBehaviorAssigner('attributes', aspectName));

		let attributesSource = getSource(aspectConfig.get('source'), 'attributes');
		this.makeBehaviorAssigner('source', aspectName)(attributesSource, 'attributes');
		attributesSource && setAction(this, `relink_attributes_source`, () => { attributesSource.relink() })

		setTextures(this, aspectConfig, initializer, this.makeBehaviorAssigner('uniforms', aspectName));
		initializeUniforms(this, aspectConfig, this.makeBehaviorAssigner('uniforms', aspectName));

		let uniformsSource = getSource(aspectConfig.get('source'), 'uniforms');
		this.makeBehaviorAssigner('source', aspectName)(uniformsSource, 'uniforms');
		uniformsSource && setAction(this, `relink_uniforms_source`, () => { uniformsSource.relink() })
	}
	makeBehaviorAssigner(type, aspectName) {
		return (thing, thingName) => {
			if (!thing) return;
			this[aspectName][type] = this[aspectName][type] || {};
			this[aspectName][type]['values'] = this[aspectName][type]['values'] || {};
			Object.defineProperty(this[aspectName][type], thingName, {
				get: () => { return this[aspectName][type]['values'][thingName] },
				set: (value) => {
					this[aspectName][type]['values'][thingName] = value;
					forEach(this.registrations[`${aspectName}:${type}:${thingName}`], (callback) => callback(value, thingName));
				}
			})
			this[aspectName][type]['values'][thingName] = thing;

		}
	}
}

function make(config, name, initializer) {
	let onFinished = initializer.register(`behaviors_${name}`);
	//iterates over all behavior files, initializing them
	let createdBehavior = new Behavior(config, name);
	createdBehavior.activate(initializer);

	setProperties(createdBehavior, config);
	let actions = initializeActions(createdBehavior, config);
	let cycles = initializeCycles(createdBehavior, config);
	let subscription = initializeSubscriptions(createdBehavior, config, initializer);

	createdBehavior.actions.initialize && createdBehavior.actions.initialize()
	onFinished.finished({ subscription, cycles, actions });
	return createdBehavior;
}

function unmake(behavior) {
	unloadActions(behavior);
	unloadCycles(behavior);
	unloadSubscriptions(behavior);
	delete behavior.core;
	delete behavior.registrations;
}



export { make, unmake }
