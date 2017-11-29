function make(context, configuration){
	let config = configuration.toJS();
	// return a defines object if a generator is not defined
	if( !config.generator && typeof config.generator !== 'function' ){ return config; }
	// takes config.value or config.generator() returning an array
	// prefers config.generator()
	// config.generator is called with the current context

	let generator = config.generator;
	generator && delete config.generator;
	let defines = generator.call(context, context.properties, config)
	return _.extend( config, defines )
}

function setDefines(context, config, setter){
	if(!config || !config.get){ return context }
  let configuration = config.get('defines');
  if(!configuration){ return context }

	if (setter) setter(make(context, configuration));
	else assign(context.material, make(context, configuration));

}

function assign(context, defines) {
  context.defines = defines;
}


export { setDefines, assign }
