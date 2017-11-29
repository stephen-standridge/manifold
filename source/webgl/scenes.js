import { initialize as initializeObject, unmake as unmakeObject } from './objects';
import { initialize as initializeCycles, unload as unloadCycles } from '../sauce/cycles';
import { initialize as initializeActions, unload as unloadActions } from '../sauce/actions';
import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../events/subscriptions';
import { fromJS } from 'immutable';
import { load } from '../core/loaders';
import { List } from 'immutable'
import * as store from '../core/store';
var RX = require('rx');

function unmake(scene) {
  let to_remove = [];
  scene && scene.traverse((child)=> {
    to_remove.push(child);
  })
  to_remove.forEach(child => {
    unmakeObject(child);
    scene.remove(child)
  })
  unloadActions(scene);
  unloadCycles(scene);
  unloadSubscriptions(scene);
}

function make(config, name, initializer){
  if (!config) {
    console.warn('no scenes defined')
    return;
  }

  let url = config.get('url');
  if (url) return loadScene(url, config, initializer.register(`scenes_${name}`));

  let scene = new three.Scene();
  scene.name = `scene_${name}`;
  scene = configure(scene, config, initializer.register(`scenes_${name}`));
  return scene;
}

function configure(scene, config, initializer) {
  let actions = initializeActions(scene, config);
  config.get('children') && config.get('children').forEach(child => scene.add(initializeObject(child, initializer)));

  let cycles = initializeCycles(scene, config);
  let subscription = initializeSubscriptions(scene, config, initializer);
  config.get('actions') && config.getIn(['actions', 'initialize']) && config.getIn(['actions', 'initialize']).call(scene)
  initializer.finished({ subscription, cycles, actions });
  return scene
}

function loadScene(url, config, initializer) {
  let scene = new three.Scene();
  let promise = [];

  if(List.isList(url)) {
    promise = url.map(u => {
      return load(initializer.locateFile(u))
    }).toJS()
  } else {
    promise = [load( '/' + initializer.locateFile(url))];
  }

  RX.Observable.merge(promise)
    .flatMap(p => {
      return RX.Observable.from(p.body.children)
        .map(child => Object.assign(child, p.body.objects[child.object]));
    })
    .subscribe(child => {
      scene.add(initializeObject(fromJS(child), initializer));
    }, err => { throw err; })
  scene = configure(scene, config, initializer);
  return scene;
}

export { make, unmake }
