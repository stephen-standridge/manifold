import { camelCase } from 'lodash';
import * as store from './store';
import { prepareObject } from '../utils/prepare';
import { make as makeCanvas, unmake as unmakeCanvas } from '../webgl/canvases';
import { make as makeRenderer, unmake as unmakeRenderer } from '../webgl/renderers';
import { make as makeScene, unmake as unmakeScene } from '../webgl/scenes';
import { make as makeBehavior, unmake as unmakeBehavior } from '../sauce/behaviors';
import { JsonSource, Source, unmake as unmakeSource } from '../sauce/sources';
import { make as makeComposition, unmake as unmakeComposition } from '../sauce/compositions';

import { initialize as initializeAttributes } from '../webgl/data/attributes';
import { initialize as initializeUniforms } from '../webgl/data/uniforms';

////////////////
///* Canvas *///
////////////////

const canvases = {};

function getCanvas(name) {
  return canvases[name];
}

function initializeCanvasConfigs(initializer) {
  canvases[initializer.name] = makeCanvas(store.get(initializer.name, 'canvas'));
}

function unloadCanvasConfigs(initializer) {
  delete canvases[initializer.name];
}

/////////////////////
////* Renderers *////
/////////////////////

const renderers = {};

function getRenderer(name) {
	return renderers[name];
}

function initializeRendererConfigs(initializer){
  let config = store.get(initializer.name, 'renderers');
  if (!config) return initializer.finished();
  config.forEach((rendererConfig, name)=> {
  	renderers[name] = makeRenderer(rendererConfig, name, getCanvas(initializer.name), initializer)
  });
	initializer.finished();
}

function unloadRendererConfigs(initializer) {
  let config = store.get(initializer.name, 'renderers');
  if (!config) return
  config.forEach((renderer, name)=> {
  	unmakeRenderer(renderers[name])
  	delete renderers[name];
  });
}


////////////////////
/////* Scenes */////
////////////////////

const scenes = {};

function getScene(name) {
	return scenes[name];
}

function initializeSceneConfigs(initializer){
  let config = store.get(initializer.name, 'scenes');
  if (!config) return initializer.finished();
  config.forEach((sceneConfig, name)=> {
  	scenes[name] = makeScene(sceneConfig, name, initializer)
  });
  initializer.finished();
}

function unloadSceneConfigs(initializer){
  let config = store.get(initializer.name, 'scenes');
  if (!config) return
  config.forEach((scene, name) => {
    unmakeScene(scenes[name]);
    delete scenes[name];
  });
}


///////////////////
///* Behaviors *///
///////////////////

const behaviors = {};

function getBehavior(name) {
  return behaviors[name];
}

function setBehaviors(context, config, type){
  if (!config || !config.get) return;

  prepareObject(context, 'behaviors');

  config.forEach((aspectConfig, behaviorName) => {
    //iterates over each defined behavior in the object file
    getBehavior(behaviorName).distribute(context, aspectConfig, type);
  });
}

function initializeBehaviorConfigs(initializer) {
  let config = store.get(initializer.name, 'behaviors');
  if (!config) return initializer.finished();

  config.forEach((behavior, name) => {
    if (!behavior.size) return;
    behaviors[name] = makeBehavior(behavior, name, initializer)
  });

  initializer.finished();
}

function unloadBehaviorConfigs(initializer){
  let config = store.get(initializer.name, 'behaviors');
  if (!config) return
  config.forEach((behavior, name) => {
    unmakeBehavior(behaviors[name]);
    delete behaviors[name];
  });
}


///////////////////
////* Sources *////
///////////////////

const sources = {};

let dataInitializers = {
  uniforms: initializeUniforms,
  attributes: initializeAttributes
}

function initializeSourceConfigs(initializer) {
  let config = store.get(initializer.name, 'sources');
  if (!config) return initializer.finished()
  config.forEach((sourceConfig, name) => {
    if (sourceConfig.size == 0) return;
    let sourceOfType = sourceConfig.get('type') == 'json' ? JsonSource : Source;
    sources[name] = sourceConfig.get('onLink') && sourceConfig.get('onLink').map((item, type) => {
      let onConnect = initializer.register(`source_${name}_${type}`);
      let url = initializer.locateSource(sourceConfig.get('url'));
      let s = new sourceOfType(sourceConfig, type, dataInitializers[type], url);
      s.connect(onConnect.finished);
      return s;
    })
  });
  initializer.finished();
}

function unloadSourceConfigs(initializer) {
  let config = store.get(initializer.name, 'sources');
  if (!config) return
  config.forEach((source, name) => {
    if (!sources[name]) return;
    sources[name].forEach((thing) => {
      thing.__knownSources = thing.__knownSources && thing.__knownSources.clear();
      thing.__identifiers = thing.__identifiers && thing.__identifiers.clear();
      delete thing.__knownSources;
      delete thing.__identifiers;
    })
    delete sources[name]
  });
}

function getSource(name, type) {
  return sources[name] && sources[name].get(type)
}

///////////////////
////* Origins *////
///////////////////

const origins = {};

function initializeOriginConfigs(initializer) {
  let config = store.get(initializer.name, 'origins');
  if (!config) return initializer.finished();
  if (typeof module == undefined) { console.warn('cannot create an origin in a browser environment'); return; }

  config.forEach((originConfig, name) => {
    if (originConfig.size == 0) return;
    let originOfType = originConfig.get('type') == 'json' ? AjaxOrigin : Origin;
    origins[name] = originConfig.get('onLink') && originConfig.get('onLink').map((item, type) => {
      let onConnect = initializer.register(`origin_${name}_${type}`);
      let url = initializer.locateOrigin(originConfig.get('url'));
      let s = new originOfType(originConfig, type, dataInitializers[type], url);
      s.connect(onConnect.finished);
      return s;
    })
  });
  initializer.finished();
}

function unloadOriginConfigs(initializer) {
  let config = store.get(initializer.name, 'origins');
  if (!config) return
  config.forEach((origin, name) => {
    if (!origins[name]) return;
    origins[name].forEach((thing) => {
      thing.__knownOrigins = thing.__knownOrigins.clear();
      thing.__identifiers = thing.__identifiers.clear();
      delete thing.__knownOrigins;
      delete thing.__identifiers;
    })
    delete origins[name]
  });
}

function getOrigin(name, type) {
  return origins[name] && origins[name].get(type)
}

////////////////////////
////* Compositions *////
////////////////////////


const composers = {
  composition: {},
  frame_buffer: {}
}

function getComposition(type='composition', name) {
  if(name) return composers[type][name];
  return composers[type];
}

function initializeCompositionConfigs(initializer, type='composition') {
  let config = store.get(initializer.name, type+'s');
  if(!config){
    if (type == 'composition') console.warn(`no ${type.split('_').join(' ') + 's'} defined`);
    initializer.finished();
    return
  }
  config.forEach((composition, name) => {
    if (!composition.size) return;
    composers[type][name] = makeComposition(composition, name, initializer.register(`${camelCase(type)}s_${name}`), type);
  })
  initializer.finished();
}

function unloadCompositionConfigs(initializer, type='composition') {
  let config = store.get(initializer.name, type+'s');
  if (!config) return
  config.forEach((composition, name) => {
    unmakeComposition(composers[type][name]);
    delete composers[type][name];
  })
}

export {
	initializeRendererConfigs, unloadRendererConfigs, getRenderer,
	initializeSceneConfigs, unloadSceneConfigs, getScene,
  initializeBehaviorConfigs, unloadBehaviorConfigs, getBehavior, setBehaviors,
  initializeSourceConfigs, unloadSourceConfigs, getSource,
  initializeCompositionConfigs, unloadCompositionConfigs, getComposition,
  initializeCanvasConfigs, unloadCanvasConfigs, getCanvas
}
