import { map } from 'lodash';
import { prepareObject } from '../../utils'

function setProperties(context, configuration, setter) {
	prepareObject(context, 'properties');
	if(!configuration || !configuration.get){ return context }
	let config = configuration.get('properties');
	if(!config){ return context }
	config = config.toJS();
	//call properties generator
	let generator = typeof config.generator == 'function' ? config.generator : false;
	let generators = config.generators && config.generators.constructor == Array ? config.generators : [];
	delete config.generators;
	delete config.generator;

	if(generator){
		generators.unshift(generator);
	}
	if(generators.length){
		config = generators.reduce(function(properties, generator){
			return Object.assign(properties, generator(properties))
		}, config)
	}
	map(config, function(property, name){
		if (setter) setter(property, name);
		else assign(context, property, name);
	})
}

function assign(context, property, name){
  if( context.properties[name] ){
    console.warn(`duplicate property assignment detected ${name} has already been defined`, context)
  }
  context.properties[name] = property;
}

export { setProperties, assign }
