const agent = require('superagent-promise')(require('superagent'), Promise);
import { LOADER_TYPES } from './constants';
var RX = require('rx');
const loaders = {};

function load(url) {
  let splitted = url.split('.');
  let type = splitted[splitted.length - 1];
  return loaders[type] && loaders[type](url) || console.error(`could not locate loader for ${type}`);
}

function initialize(initializer) {
  Object.keys(LOADER_TYPES).forEach((type) => {
    loaders[type] = function load(url) {
      return RX.Observable.fromPromise(agent.get(url));
    }
  })
  initializer.finished();
}

function unload(initializer) {
  Object.keys(loaders).forEach((name)=>{
    delete loaders[name];
  })
}

export { initialize, unload, load };
