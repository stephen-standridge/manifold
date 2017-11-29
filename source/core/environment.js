import * as store from './store';
import { disconnect } from '../events';
var RX = require('rx');

const ENV_observables = {};
const ENV = {};

function initialize(initializer) {
	let name = initializer.name;
	let isManifold = name === 'manifold';
	let config = isManifold ? store.get('environment') : store.get(name, 'environment');
	if(!config) return initializer.finished();

	config.forEach((value, key) => {
		let lookup = isManifold ? key : `${name}.${key}`;
		if (isManifold) {
			ENV_observables[key] = new RX.BehaviorSubject();
			Object.defineProperty(ENV, key, {
				configurable: true,
				set: (v) => { return ENV_observables[key].onNext(v)},
				get: () => { return ENV_observables[key].getValue()}
			})
			ENV_observables[key].onNext(value)
		} else {
			ENV_observables[name] = ENV_observables[name] || {};
			ENV_observables[name][key] = new RX.BehaviorSubject();
			Object.defineProperty(ENV, lookup, {
				configurable: true,
				set: (v) => { return ENV_observables[name][key].onNext(v)},
				get: () => { return ENV_observables[name][key].getValue()}
			})
			ENV_observables[name][key].onNext(value)
		}
	})

	initializer.finished()
	return
}

function unload(initializer) {
	let name = initializer.name;
	let isManifold = name === 'manifold';
	let config = isManifold ? store.get('environment') : store.get(name, 'environment');
	if(!config) return
	disconnect(!isManifold && name);

	config.forEach((value, key) => {
		let lookup = isManifold ? key : `${name}.${key}`;
		if (isManifold) {
			Object.defineProperty(ENV, key, {
			    value: undefined
			});
			delete ENV_observables[key]
		} else {
			Object.defineProperty(ENV, lookup, {
			    value: undefined
			});
			delete ENV_observables[name][key];
		}
	})
	if (!isManifold) delete ENV[name]
	return ENV
}


export { initialize, ENV_observables, unload, ENV };
