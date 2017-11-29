import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../../../events/subscriptions';
import { initialize as initializeCycles, unload as unloadCycles } from '../../cycles';
import { initialize as initializeActions, unload as unloadActions, setAction } from '../../actions';
import { initialize as initializeLayers, unload as unloadLayers } from '../layers';
import { initialize as initializeObject, unload as unloadObject } from '../../../webgl/objects';
import { make as makeScene, unmake as unmakeScene } from '../../../webgl/scenes';
import { make as makeRenderer, unmake as unmakeRenderer } from '../../../webgl/renderers';
import { getRenderer, getScene, getCanvas } from '../../../core/initializers';
import * as store from '../../../core/store';
import * as composition_types from './composition_types'
import { fromJS, List } from 'immutable';

let compositionCount = 0;

function renderLayers() {

	this.layers.forEach(l => l.enabled && l.actions.render(this, l.renderTargets ? l.renderTargets[this.currentTextureIndex] : null));
  this.nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;
	this.currentTextureIndex = this.nextTextureIndex;
}

function render() {
	this.renderer.render(this.scene, this.camera);
}

function make(config, name, initializer, type='composition'){
	let composition, renderer;

	if(!config || !config.get) {
		initializer.finished();
		return
	}

  let extension = type == 'frame_buffer' ? 'frame_buffer' : config.get('material') ? 'material' : 'render';
  if (extension){
  	let materialConfig = config.get('material');
  	if (typeof materialConfig == 'string') {
			config = config.set('material', store.get(initializer.name, 'materials', materialConfig));
  	}
  	config = composition_types[extension](config);
  }
	composition = {};
	let actions = initializeActions(composition, config);

	if (typeof config.get('renderer') == 'string'){
		composition.renderer = getRenderer(config.get('renderer'));
	} else if (config.get('renderer')) {
		composition.renderer = makeRenderer(config.get('renderer'), `composition_${compositionCount}`, getCanvas(initializer.name), initializer);
		composition.shouldUnmakeRenderer = true;
	}


  if (typeof config.get('scene') == 'string') {
		composition.scene = getScene(config.get('scene'))
  } else if (config.get('scene')) {
  	composition.shouldUnmakeScene = true;
  	composition.scene = makeScene(config.get('scene'), `composition_${compositionCount}`, initializer)
  }

  if (config.get('camera')) {
	  composition.camera = initializeObject(config.get('camera'), initializer);
	  composition.scene.add(composition.camera)
  }

  setAction(composition, 'render', config.get('layers') ? renderLayers : render);
	initializeLayers(composition, config, initializer);

	let cycles = initializeCycles(composition, config);
	let subscription = initializeSubscriptions(composition, config, initializer);
	initializer.finished({ subscription, cycles, actions });
	compositionCount++;

	composition.actions.initialize && composition.actions.initialize();
  composition.currentTextureIndex = 0;
  composition.nextTextureIndex = 1;
	return composition
}

function unmake(composition) {
  unloadActions(composition);
  unloadSubscriptions(composition);
	unloadCycles(composition);
	unloadLayers(composition);
	if(composition.shouldUnmakeScene) {
		unmakeScene(composition.scene);
		delete composition.scene;
	}
	if(composition.shouldUnmakeRenderer) {
		unmakeRenderer(composition.renderer);
		delete composition.renderer;
	}
	compositionCount--;
}



export { make, unmake }
