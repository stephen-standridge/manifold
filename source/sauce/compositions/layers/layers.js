import { initialize as initializeMaterial, unload as unloadMaterial } from '../../../webgl/materials';
import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../../../events/subscriptions';
import { initialize as initializeCycles, unload as unloadCycles } from '../../cycles';
import { initialize as initializeActions, unload as unloadActions, setAction } from '../../actions';
import { initialize as initializeObject, unload as unloadObject } from '../../../webgl/objects';
import { initializeLayerTexture, unloadLayerTexture } from '../../../webgl/data/textures';
import { make as makeScene, unmake as unmakeScene } from '../../../webgl/scenes'
import { getScene } from '../../../core/initializers';
import { make as makeRenderTarget } from '../render_target';
import { fromJS } from 'immutable';
import * as store from '../../../core/store';
import * as layer_types from './layer_types'

let layerCount = 0;

function renderInitialValue(composition, layer) {
	layer.prevMaterial = layer.material;
	layer.prevScene = layer.scene;
	layer.scene = layer.initialValue.scene || layer.scene;
	layer.material = layer.initialValue.material || layer.material;
	layer.actions.render(composition, layer.renderTargets ? layer.renderTargets[0] : null)
	layer.actions.render(composition, layer.renderTargets ? layer.renderTargets[1] : null)
	layer.material = layer.prevMaterial;
	layer.scene = layer.prevScene;
}

function render(composition, target) {
	if(this.camera && !this.camera.isCamera) {
		this.camera.updateCubeMap(composition.renderer, this.scene || composition.scene);
		this.texture.value = this.camera.renderTarget.texture;
	} else {
		composition.renderer.render(this.scene || composition.scene, this.camera || composition.camera, target)
		if (this.texture) {
			this.texture.value = target.texture;
		}
	}
}

function renderWithMaterial(composition, target) {
	if (this.scene) {
		this.scene.overrideMaterial = this.material;
	} else {
		composition.scene.overrideMaterial = this.material;
	}
	render.call(this, composition, target)
	if (this.scene) {
		this.scene.overrideMaterial = null;
	} else {
		composition.scene.overrideMaterial = null;
	}
}

function renderLayer(composition, target) {
	if(this.camera && !this.camera.isCamera) {
		this.camera.updateCubeMap(composition.renderer, this.scene || composition.scene);
		this.texture.value = this.camera.renderTarget.texture;
	} else {
		composition.renderer.render(this.scene || composition.scene, this.camera || composition.camera, target)
		if (this.texture) {
			this.texture.value = target.texture;
		}
	}
}

function renderLayerMaterial(composition, target) {
	let oldMaterial = this.scene.overrideMaterial;
	this.scene.overrideMaterial = this.material;
	renderLayer.call(this, composition, target);
	this.scene.overrideMaterial = oldMaterial;
}

function make(configuration, layerName, size, initializer) {
  if( !configuration || !configuration.get ){ return }

  let config = configuration;
	let extension = config.get('type');
	let materialConfig = config.get('material');

	if (typeof materialConfig == 'string') {
		config = config.set('material', store.get(initializer.name, 'materials', materialConfig));
	}
	let rendererSize = [size.width, size.height];
	if (extension) {
		config = layer_types[extension](config, rendererSize);
	}
  let layer = {
		name: layerName,
		renderTargets: config.get('texture') ? [makeRenderTarget(config, rendererSize), makeRenderTarget(config, rendererSize)] : false,
		enabled: String(config.get('enabled')) == 'false' ? false : true
  };
  //allow initializing materials on layers
	let actions = initializeActions( layer, config );
	if (typeof config.get('scene') == 'string') {
		layer.scene = getScene(config.get('scene'));
		layer.prevScene = layer.scene;
	} else if (config.get('scene')) {
		layer.scene = makeScene(config.get('scene'), `layer_${layerCount}`, initializer);
		layer.prevScene = layer.scene;
		layer.shouldUnmakeScene = true;
	}

	if (config.get('camera')) {
		layer.camera = initializeObject(config.get('camera'), initializer);
	}

	initializeLayerTexture(layer, config, initializer);
	initializeMaterial(layer, config, initializer);
	layer.prevMaterial = layer.materia;

  setAction(layer, 'render', layer.render = layer.scene ?
		layer.material ? renderLayerWithMaterial : renderLayer :
		layer.material ? renderWithMaterial : render);

	let cycles = initializeCycles( layer, config );
	let subscription = initializeSubscriptions(layer, config, initializer);
	initializer.finished({ subscription, cycles, actions });
	layerCount++;
	layer.actions.initialize && layer.actions.initialize();
	return layer

}

function initialize(context, config, initializer) {
	if (!config || !config.get) return;
	if (!config.get('layers')) return;
	if (!context.renderer) {
		console.warn(`no renderer defined for composition ${context}`);
		return
	}
	if (!context.renderer.extensions.get( "OES_texture_float" )) {
		console.error("No OES_texture_float support for float textures.")
		// return;
	}

	if (context.renderer.capabilities.maxVertexTextures === 0) {
		console.error("No support for vertex shader textures.");
		return;
	}

	context.layers = [];

	config.get('layers').forEach((layerConfig, name, index) => {
		let layer = make(layerConfig, name, context.renderer.getSize(), initializer.register(`layer_${name}`));
		if (layer.scene && layer.camera) layer.scene.add(layer.camera);
		if (layer.camera && context.scene) context.scene.add(layer.camera);
		if (layer.scene && context.camera) layer.scene.add(context.camera);
		if (layer.initialValue) renderInitialValue(context, layer);
		layer.renderer = context.renderer;
		context.layers.push(layer);
	})
}

function unload(context) {
	if (!context.layers) return;
	context.layers.forEach(unmake);
	delete context.layers;
}

function unmake(layer) {
	layer && layer.renderTargets && layer.renderTargets.forEach(r => r.unload && r.unload())
  unloadActions(layer);
  unloadSubscriptions(layer);
	unloadCycles(layer);
	unloadLayerTexture(layer);
	unloadMaterial(layer);
	if (layer.shouldUnmakeScene) {
		delete layer.scene;
		unmakeScene(layer.scene);
	}
	layerCount--;
}


export { initialize, unload }
