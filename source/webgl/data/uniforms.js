import { setAction } from '../../sauce/actions';
import { isCoreKey } from '../../utils/isCoreKey'
var three = require('three');

function makeData(context, config, name){
	if (config.value !== undefined) return config.value

	let generator = config.generator;
	generator && delete config.generator;
	let generatedData = typeof generator == 'function' ? generator.call(context, context.properties, config) : false;
	if (generatedData && generatedData[name] ) return generatedData[name];
	if (generatedData) return generatedData;

	// takes config.array or config.generator() returning an array
	// prefers config.generator()
	// config.generator is called with the current context
}

function make(context, config, name){
	if (config.get) config = config.toJS();
	let type, value, uniform;

	type = config.type;
	value = makeData(context,config,name);
	// value = { type, value };
  if (value.type && value.value) return value;

  // value = 0 || THREE.Vec3 || THREE.Vec2 ...
	uniform = new three.Uniform(value);
	return uniform;
}

function initialize( context, config, setter ){
	if (!config || !config.get) return context;
  let configuration = config.get('uniforms');
  if (!configuration) return context;
 	let generator = configuration.get('generator');

  if (generator) {
  	configuration = configuration.delete('generator');
  	let generated = generator.call(context, context.properties, configuration);
  	configuration = configuration.merge(generated);
  }

  configuration.forEach((config, name) => {

		if (isCoreKey( name )) return;
		let uniform = make(context, config);
		setAction(context, `update_${name}`, update.bind(uniform));

		if (setter) setter(uniform, name);
		else assign(context.material, uniform, name);
  })

  return context;
}

function update ( v ){
  if (typeof v == 'array' && this.value.fromArray) { this.value.fromArray(v); return; }
	this.value = v;
}

function assign(context, uniform, name) {
  context.uniforms = context.uniforms || {};
  context.uniforms[name] = uniform;
}

export { initialize, assign }
