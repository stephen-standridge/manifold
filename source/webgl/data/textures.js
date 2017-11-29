import { setAction } from '../../sauce/actions';
import { Behavior } from '../../sauce/behaviors';
import { lerp } from '../../utils';
import { TEXTURE_TYPES, TEXTURE_FORMATS, ARRAY_TYPES, MAPPING_MODES, TEXTURE_WRAPPINGS } from '../../core/constants'
var three = require('three');

const namedTextures = {}

function makeData(context, config, name) {
	let arrayData = config.array;
	if(arrayData) return arrayData
	// takes config.array or config.generator() returning an array
	// prefers config.generator()
	// config.generator is called with the current context
	let generator = typeof config == 'function' ? config : config.generator;
	config.generator && delete config.generator;
	let generatedData = typeof generator == 'function' ? generator.call(context, context.properties, config) : false;
	if(generatedData && generatedData.constructor == Array) return generatedData;
	if(generatedData && generatedData[name] ) return generatedData[name];
}

function makeGradient(context, config, name) {
	let { stops, width, height } = config;
	if(!stops || !width || !height) { console.error(`texture ${name} is missing width, height or stops`); return; }
	// takes config.stops, returns a lerp gradient
	let colors = [], c = [], color1, color2, stop1, stop2, f;
	// Now read the gradient info and fill the buffer with BGRA colors.
	for(let i = 0; i < stops.length - 1; ++i ) {
		color1 = stops[i];
		color2 = stops[i + 1];

		if (color1.position < 0 || color1 > 1) { console.error(`texture ${name} stop ${i} has a position outside of 0-1`); return; }
		if (color2.position < 0 || color2 > 1) { console.error(`texture ${name} stop ${i+1} has a position outside of 0-1`); return; }
		if (color2.position > color2.position ) { console.error(`texture ${name} stop positions are out of order`); return; }

		// Convert float to a value between 0 and 255.
		stop1 = Math.floor(color1.position * (width - 1));
		stop2 = Math.floor(color2.position * (width - 1));
		for(let x = stop1; x <= stop2; ++x ) {
			// Calculate color.
			f = ( x - stop1 ) / ( stop2 - stop1 );
			c = [lerp( color1.value[0], color2.value[0], f ),
						lerp( color1.value[1], color2.value[1], f ),
						lerp( color1.value[2], color2.value[2], f ),
						lerp( color1.value[3], color2.value[3], f )];

			// Convert to RGBA bytes and store in buffer.
			for(let y = 0; y < height; ++y ) {
				colors[( width * y + x ) * 4 + 0] = c[0];
				colors[( width * y + x ) * 4 + 1] = c[1];
				colors[( width * y + x ) * 4 + 2] = c[2];
				colors[( width * y + x ) * 4 + 3] = c[3];
			}
		}
	}
	return colors;
}

function makeDataTexture(context, config, name) {
	let arrayOfType, textureOfType, textureType, textureFormat, textureMapping, textureWrapS, textureWrapT, data, value, texture, uniform;

	arrayOfType = ARRAY_TYPES[config.arrayType || 'Float32Array']
	textureType = TEXTURE_TYPES[config.type || 'FloatType']
	textureFormat = TEXTURE_FORMATS[config.format || 'RGBAFormat']
	textureMapping = MAPPING_MODES[config.mapping || 'UVMapping']
	textureWrapS = TEXTURE_WRAPPINGS[config.wrapS || 'ClampToEdgeWrapping']
	textureWrapT = TEXTURE_WRAPPINGS[config.wrapT || 'ClampToEdgeWrapping']

	data = config.stops ? makeGradient(context, config, name) : makeData(context, config, name);
	if (config.cube) {
		value = data.map((set)=>{
			return new three.DataTexture( new arrayOfType(set), config.width, config.height, textureFormat, textureType, textureMapping)
		})
		texture = new three.CubeTexture( value )
	} else {
		value = new arrayOfType( data );
		texture = new three.DataTexture( value, config.width, config.height, textureFormat, textureType, textureMapping);
		texture.wrapS = textureWrapS
		texture.wrapT = textureWrapT
	}
	texture.type = textureType;
	texture.format = textureFormat;
	texture.needsUpdate = true;
	texture.minFilter = three.NearestFilter;
	return texture
}

function makeImageTexture(context,config,name,initializer) {
	let texture,
			textureFormat = TEXTURE_FORMATS[config.format || 'RGBAFormat'],
			textureMapping = MAPPING_MODES[config.mapping || 'UVMapping'],
			textureWrapS = TEXTURE_WRAPPINGS[config.wrapS || 'ClampToEdgeWrapping'],
			textureWrapT = TEXTURE_WRAPPINGS[config.wrapT || 'ClampToEdgeWrapping'];
	if(typeof config.url == 'string') {
		texture = new three.TextureLoader().load(initializer.locateFile(config.url));
		texture.format = textureFormat;
		texture.mapping = textureMapping;
		texture.wrapS = textureWrapS;
		texture.wrapT = textureWrapT;
	} else if(config.url.constructor == Array) {
		texture = new three.CubeTextureLoader().load(config.url.map((url) => initializer.locateFile(url)));
		texture.format = textureFormat;
		texture.mapping = textureMapping;
	}
	return texture;
}

function setTextures(context, configuration, initializer, setter) {
  if (!configuration || !configuration.get) { return }
  let config = configuration.get('textures');
  if (!config) { return }

  let textureUniform;

	if (config.call) {
		config = config.call(context);
		if(typeof config !== 'object') {
			console.warn('textures constructor did not return an iterable list of textures to initialize');
			return;
		}
		Object.keys(config).map((name) => {
			let texture = config[name];
			if (typeof texture === 'string') {
				textureUniform = getNamedTexture(context, texture)
			} else {
				textureUniform = make(context, texture, name, initializer)
			}
			if (setter) setter(textureUniform, name);
			else assign(context.material, textureUniform, name);
		})
		return
	}
	config.map((texture, name) => {
		if (typeof texture === 'string') {
			textureUniform = getNamedTexture(context, texture)
		} else {
			textureUniform = make(context, texture, name, initializer)
		}
		if (setter) setter(textureUniform, name);
		else assign(context.material, textureUniform, name);
	})
}

function getNamedTexture(context, name) {
	if (namedTextures[name]) {
		return namedTextures[name];
	} else {
		console.warn(`cannot find a texture named ${ name }`, context);
		namedTextures[name] = { type: 't', value: null };
		return namedTextures[name];
	}
}

function  make(context, config, name, initializer) {
	let updator, uniform, subscriptions;

	if (config && config.get){ config = config.toJS() }
	let texture;
	if(config && (config.url || config.urls)) {
		texture = makeImageTexture(context,config,name,initializer)
	} else if(config.array || config.generator || typeof config == 'function' || config.stops) {
		texture = makeDataTexture(context,config,name)
	} else if(config.value) {
		texture = config.value
	} else {
		texture = null
	}
	// uniform = { type: 't', value: texture, name }
	uniform = new three.Uniform(texture)
	setAction(context, `update_${ name }`, update.bind(uniform))

	return uniform
}

function initializeLayerTexture(layer, configuration, initializer) {
	let config = configuration && configuration.get ? configuration.get('texture') : configuration.texture;
	if (!config) return
	config = config.get ? config.toJS() : config;
	if (config.id && namedTextures[config.id]) {
		layer.texture = namedTextures[config.id];
		return
	}
	let [ width, height ] = config.size;
	let textureUniform = make(layer, Object.assign({ width, height }, config), config.id, initializer);
	if(!namedTextures[config.id]) {
		namedTextures[config.id] = textureUniform;
	}
	layer.texture = namedTextures[config.id];
	return
}

function unloadLayerTexture(layer) {
	if (layer.texture && layer.texture.name) {
		namedTextures[layer.texture.name].value.dispose();
		delete namedTextures[layer.texture.name];
		delete layer.texture;
	}
}

function update(delta) {
	this.value = this.value;
	this.needsUpdate = true;
}

function assign(context, uniform, name) {
  context.uniforms = context.uniforms || {};
  context.uniforms[name] = uniform;
}

export { make, setTextures, initializeLayerTexture, unloadLayerTexture, assign }
