import { initialize as initializeMaterial, unload as unloadMaterial } from './materials';
import { initialize as initializeAttributes } from './data/attributes';
import { setProperties } from './data/properties';
import { initialize as initializeCycles, unload as unloadCycles } from '../sauce/cycles';
import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../events/subscriptions';
import { initialize as initializeActions, unload as unloadActions } from '../sauce/actions';
import { assign as assignSource } from '../sauce/sources';
import { setBehaviors, getSource } from '../core/initializers';
import { construct } from '../utils/constructor';
import { isCoreKey } from '../utils/isCoreKey';
import { forEach } from 'lodash'
import * as store from '../core/store';
var three = require('three');
let objectCount = 0;

const objectKeys = {
  type:'type', arguments:'arguments', data: 'data'
}

function make(config){
  if( !config ){ console.warn('cannot create an object without configuration'); return }
  let args = config.arguments ? config.arguments.slice() : [];

  let object = construct(config.type || 'Mesh', args)
  forEach(config, (value, key)=>{
    if(objectKeys[key] !== undefined) return;
    if(key == 'matrix'){
      object.applyMatrix(new three.Matrix4().fromArray(value))
    } else {
      try {
        object[key] = value;
      } catch (e) {
        object[key].set(...value);
      }
    }
  })
  return object
}

function unmake(object) {
  unloadActions(object);
  unloadSubscriptions(object);
  unloadCycles(object);
  delete object.actions;
  unloadMaterial(object)
  object.geometry &&
  object.geometry.attributes &&
  Object.keys(object.geometry.attributes).forEach((k)=>{
    object.geometry.attributes[k].dispose &&
    object.geometry.attributes[k].dispose()
  })
  object.geometry && object.geometry.dispose()
}

function initialize(possiblyObject, initializer) {
  if (!possiblyObject) { console.warn('attempted to initialize an undefined object'); return; }
  let object = possiblyObject, name, prefix, config, configuration, objectConfig={};
  let notObj = !(possiblyObject instanceof three.Object3D);
  var g = global || window;
  let notObjOfWindow = !g.three || !(possiblyObject instanceof g.three.Object3D)
  if ( notObj && notObjOfWindow ) {
    name = (typeof possiblyObject == 'string' && possiblyObject) ||
            (possiblyObject.get && possiblyObject.get('object') || possiblyObject.get('name')) || // immutable config, name
            possiblyObject.name;
    if (name){
      let non_indexed_name = name.split('_');
      non_indexed_name = non_indexed_name.map((item)=> isNaN(Number(item)) && item ).filter((item)=> item);
      configuration = store.get(initializer.name, 'objects', non_indexed_name.join('_'));
    } else {
      //assume the object the configuration
      configuration = possiblyObject;
    }

    if(!configuration){
      console.warn('could not find configuration for ' + name);
      return;
    }
    configuration = possiblyObject.toJS && possiblyObject.merge(configuration) || configuration;
    configuration.forEach((property, index) => {
      if (isCoreKey(index)) return;
      objectConfig[index] = property.toJS ? property.toJS() : property;
    })

    object = objectConfig.actions && objectConfig.actions.create && objectConfig.actions.create(objectConfig) || make(objectConfig);
  } else {
    name = object.name ? object.name.split('_')[0].toLowerCase() : ``
    configuration = store.get(initializer.name, 'objects', name);
    object.name = object.name || `object_${name}_${objectCount}`
  }

  let onFinished = initializer.register(`objects_${name}_${objectCount}`).finished;
  let cycles, subscription, actions;

  if (configuration) {
    actions = initializeActions(object, configuration);
    let behaviorConfig = configuration.get('behaviors');

    setProperties(object, configuration);
    setBehaviors(object, behaviorConfig, 'properties');
    setBehaviors(object, behaviorConfig, 'source');
    initializeAttributes(object, configuration);
    setBehaviors(object, behaviorConfig, 'attributes');
    assignSource(object, getSource(configuration.get('source'), 'attributes'), 'attributes');

    initializeMaterial(object, configuration, initializer);
    cycles = initializeCycles(object, configuration);
    subscription = initializeSubscriptions(object, configuration, initializer);

    object.actions.initialize && object.actions.initialize();
  }
  onFinished({ subscription, cycles, actions });
  objectCount++;
  return object;
}




export { make, unmake, initialize }
