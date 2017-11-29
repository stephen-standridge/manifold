import { fromJS, Map } from 'immutable';

let store = fromJS({})


function load(program, config) {
	store = store.set(program, config.toJS ? config : fromJS(config));
}

function unload(program) {
	store = store.delete(program);
}

function get(...path) {
	return store.getIn(path)
}

function getFromAllPrograms(...path) {
	let returned = store.reduce((sum, program) => {
		let found = program.getIn(path);
		if (found) return found;
		return sum;
	}, undefined)
	return returned && returned.toJS()
}

export { load, unload, get, getFromAllPrograms }
