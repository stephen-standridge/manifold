import { initialize as initializeUniforms } from './data/uniforms';
import { setDefines } from './data/defines';
import { setBehaviors } from '../core/initializers';
import { setTextures } from './data/textures';
import { assign as assignSource } from '../sauce/sources';
import { isCoreKey } from '../utils';
import * as store from '../core/store';
import * as includes from './glsl';
var three = require('three');

let materialCount = 0;
function isShaderKey(key) {
  return key == 'type';
}

const defaultMaterial = three.ShaderMaterial;

function make(config, context) {
  materialCount++;
  if (!config || !config.get) return new defaultMaterial({ color: 0xffffff });
  if (!config.get('fragmentShader') || !config.get('vertexShader')) return new defaultMaterial(config.toJS())

  let materialConfig = {};
  config.map((property, name) => {
    if (isCoreKey(name)) return;
    if (isShaderKey(name)) return;

    if (name == 'vertexInclues') {
      materialConfig['vertexShader'] = property.map((string)=>{
        return includes[string]
      }).join('/n').concat(materialConfig['vertexShader'])
      return
    } else if (name == 'fragmentIncludes') {
      materialConfig['fragmentShader'] = property.map((string)=>{
        return includes[string]
      }).join('/n').concat(materialConfig['fragmentShader'])
      return
    }
    materialConfig[name] = (property.toJS && property.toJS()) ||
                          (property.call && property.call(context, config)) ||
                          property
  });

  let type = config.get('type') ? config.get('type') : 'ShaderMaterial';
  return new three[type](materialConfig);

}

function initialize(context, configuration, initializer) {
  let config, material, lookup, found;
  if (!configuration || !configuration.get) return context;
  if (!configuration.get('material')) return context;

  config = configuration.get('material');
  lookup = typeof config == 'string' ? config : `material_${materialCount}`
  found = store.get(initializer.name, 'materials', lookup);
  if(found) {
    config = found;
  }

  context.material = make(config, context);
  context.material.name = lookup;
  context.material.properties = configuration.get('properties') ? configuration.get('properties').toJS() : {};

  setDefines(context, config);
  // setBehavior( 'source', context, config, assignSource.bind(context.material) )
  setTextures(context, config, initializer);
  initializeUniforms(context, config);
  setBehaviors(context, config.get('behaviors'), 'uniforms');
  assignSource(context, config.get('source'), 'uniforms');

  return context.material;
}

function unload(context) {
  context.material &&
  context.material.uniforms &&
  Object.keys(context.material.uniforms).forEach((k)=>{
    context.material.uniforms[k].value &&
    context.material.uniforms[k].value.dispose &&
    context.material.uniforms[k].value.dispose()
  })
  context.material && context.material.dispose()
}

export { make, initialize, unload }
