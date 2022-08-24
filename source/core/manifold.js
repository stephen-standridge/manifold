var _ = require('lodash');
import { Map, fromJS } from 'immutable';
import {
  initializeRendererConfigs, unloadRendererConfigs,
  initializeSceneConfigs, unloadSceneConfigs,
  initializeBehaviorConfigs, unloadBehaviorConfigs,
  initializeSourceConfigs, unloadSourceConfigs,
  initializeCompositionConfigs, unloadCompositionConfigs,
  initializeCanvasConfigs, unloadCanvasConfigs
} from './initializers'
import * as environment from './environment';
import * as events from '../events';
import * as loaders from './loaders';
import * as sources from '../sauce/sources';
import * as behaviors from '../sauce/behaviors';
import * as store from './store';
var RX = require('rx');
const state = {};
state.programs = {};
state.controllers = {};
state.programConfigs = Map({});
state.systems = {};

function logLoad() {
}
function logError(err) {
  console.error(err)
}
function logProgress() {
}

const queuePause = new RX.Subject();
const queueSubject = new RX.Subject();
const finishedSubject = new RX.Subject();
const actionStream = queueSubject.pausableBuffered(queuePause)
  .subscribe(enqueued => {
    enqueued.action.apply(null, enqueued.args)
  });

function initializeManifold(options = {}, env = {}, el) {
  el = el && ((el.length && el[0]) || el) ||
    document.querySelectorAll('.manifold') && document.querySelectorAll('.manifold')[0] ||
    document.body

  queuePause.onNext(false)
  if (state['manifold']) {
    console.warn(`cannot load 'manifold', one is already initialized`);
    queuePause.onNext(true)
    return false
  }
  state['manifold'] = {
    toStart: [],
    loaded: 0,
    total: 0,
    el: el,
    finishedSubscription: finishedSubject.debounce(1000).filter(t => t == 'manifold').subscribe(start),
    onInitialize: options.onInitialize || function () { }
  };

  let onProgress = options.onProgress || logProgress;
  let onError = options.onError || logError;
  let onLoad = options.onLoad || logLoad;

  const initializer = initializeProgram('manifold', Object.assign({ onProgress, onLoad, onError, el }, options));
  store.load('environment', env || {});
  environment.initialize(initializer.register('environment'));
  loaders.initialize(initializer.register('loaders'));
  events.initialize(el, initializer.register('events'));
  initializer.finished();
}

function start(type) {
  if (state[type].loaded < state[type].total) return;
  startProgram(type)
  state[type].finishedSubscription.dispose();
  state[type].onInitialize();
  delete state[type].finishedSubscription;
  queuePause.onNext(true)
}

function onFinish(type, options, controller, system) {
  state[type[0]].loaded++;
  let newController = createController(type, controller);
  if (newController) setController(type, newController);
  if (system) setSystem(type, system);
  finishedSubject.onNext(type[0]);
  return;
}

function onRegister(type, options, newType, system) {
  if (!newType) {
    console.warn(`cannot register child of ${type.join(', ')}`);
    return;
  }
  return initializeProgram(type.concat(newType), options);
}


///////////////////
//* Controllers *//
///////////////////

function setController(type, controller) {
  let program = type.slice().shift();
  let name = type.pop().split('_');

  state[program].toStart.push(controller);
  state.controllers[program] = state.controllers[program] || {};
  state.controllers[program][name[0]] = state.controllers[program][name[0]] || {};
  let existingController = state.controllers[program][name[0]][name[1]];
  if (existingController) {
    state.controllers[program][name[0]][name[1]] = [].concat(existingController, controller)
  } else {
    state.controllers[program][name[0]][name[1]] = controller
  }
}

function getControllers(name) {
  return state.controllers[name] ? state.controllers[name] : state.controllers;
}

function createController(type, controller) {
  let name = type.slice().pop().split('_');
  let hasController = controller && Object.keys(controller).length > 0;
  if (!hasController) return;
  // remove all null values
  let newController = {};
  Object.keys(controller).forEach(key => {
    if (!controller[key]) return;
    newController[key] = controller[key];
  })

  hasController = Object.keys(newController).length > 0;
  return hasController && newController
}


/////////////////////////
//* program functions *//
/////////////////////////

function initializeProgram(type, options = {}) {

  let types = [].concat(type);
  let { onLoad, onProgress, onError } = options;
  state[types[0]].total++;
  let register = onRegister.bind(_, types, options);
  let finished = onFinish.bind(_, types, options);
  let locateFile = options.locateFile || function (url) {
    return url && process.env.ASSET_HOST + url;
  };
  let locateSource = options.locateSource || function (url) {
    return url && process.env.SOURCE_HOST + url;
  };

  let el = options.el || state['manifold'].el || document.body;
  return {
    finished,
    register,
    name: types[0],
    withEventFiltering: types[0] !== 'manifold',
    locateFile,
    locateSource,
    el,
    onLoad,
    onProgress,
    onError
  };
}

function loadProgram(name, configuration, options = {}, el) {
  el = el && ((el.length && el[0]) || el)
  queuePause.onNext(false)
  if (state[name]) {
    console.warn(`cannot load ${name}, a program with that name already exists`);
    queuePause.onNext(true)
    return false
  }
  state[name] = {
    toStart: [],
    loaded: 0,
    total: 0,
    el: el,
    finishedSubscription: finishedSubject.debounce(1000).filter(t => t == name).subscribe(start),
    onInitialize: options.onInitialize || function () { }
  };
  const initializer = initializeProgram(name, Object.assign({ el }, options));

  if (!initializer) {
    queuePause.onNext(true)
    return;
  }
  store.load(name, configuration());

  environment.initialize(initializer.register('env'));
  state.programs[name] = events.createEventStream(name);

  initializeSourceConfigs(initializer.register('sources'));
  initializeBehaviorConfigs(initializer.register('behaviors'));

  initializeCanvasConfigs(initializer);

  initializeRendererConfigs(initializer.register('renderers'));
  initializeSceneConfigs(initializer.register('scenes'));

  initializeCompositionConfigs(initializer.register('frame_buffers'), 'frame_buffer');
  initializeCompositionConfigs(initializer.register('compositions'), 'composition');
  initializer.finished();
}

function unloadProgram(name, options = {}) {
  queuePause.onNext(false)
  if (!state[name]) {
    console.warn(`cannot unload ${name}, it is not loaded`);
    queuePause.onNext(true)
    return false
  }

  stopProgram(name);
  state[name].toStart.forEach((toStart) => {
    let subscription = toStart.subscription;
    subscription && Object.keys(subscription.list).forEach((s) => subscription.list[s].dispose());
  });
  Object.keys(state.controllers[name]).forEach(k => {
    let controllers = state.controllers[name][k];
    Object.keys(controllers).forEach(c => {
      let subscription = controllers[c].subscription;
      subscription && Object.keys(subscription.list).forEach(s => {
        subscription.list[s].dispose();
        delete subscription.list[s];
      })
      delete controllers[c].subscription;
    })
    delete state.controllers[name][k];
  })
  state.controllers[name] && delete state.controllers[name];
  state.programs[name] && delete state.programs[name];
  events.deleteEventStream(name);
  delete state[name];

  let initializer = { name };

  unloadSourceConfigs(initializer);
  unloadBehaviorConfigs(initializer);

  unloadCompositionConfigs(initializer, 'composition');
  unloadCompositionConfigs(initializer, 'frame_buffer');
  unloadSceneConfigs(initializer);
  unloadRendererConfigs(initializer);
  unloadCanvasConfigs(initializer);

  environment.unload(initializer);
  store.unload(initializer);
  queuePause.onNext(true)
  options.onUninitialize && options.onUninitialize();
}

function startProgram(name) {
  if (state.programs[name]) state.programs[name].start();
  state.systems.events.start();
}

function stopProgram(name) {
  if (state.programs[name]) state.programs[name].stop();
  if (!name) state.systems.events.stop();
}


///////////////////////////
///////* interface *///////
///////////////////////////


function getSystems(name) {
  return state.systems[name] ? state.systems[name] : state.systems;
}

function setSystem(type, config) {
  let name = type.slice().pop().split('_');
  state.systems[name[0]] = config
}

function getStatus() {
  return Object.keys(state.programs).reduce((sum, program) => {
    return Object.assign(sum, {
      [program]: {
        toStart: state[program].toStart,
        loaded: state[program].loaded,
        total: state[program].total
      }
    })
  }, {})
}

function getProgramConfig(type) {
  return state.programConfigs.get(type)
}

function setProgramConfig(type, config) {
  state.programConfigs = state.programConfigs.set(type, config);
  return state.programConfigs.get(type)
}


function load(name, configuration, options, el) {
  queueSubject.onNext({ action: loadProgram, args: [name, configuration, options, el] })
}

function unload(name, options) {
  queueSubject.onNext({ action: unloadProgram, args: [name, options] })
}

function initialize(opts, env, el) {
  queueSubject.onNext({ action: initializeManifold, args: [opts, env, el] })
  queuePause.onNext(true)
}

const getFromAllPrograms = store.getFromAllPrograms

export { load, unload, initialize, getFromAllPrograms, getControllers, getStatus, getSystems, getProgramConfig, setProgramConfig, startProgram, stopProgram }
