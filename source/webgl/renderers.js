import { initialize as initializeCycles, unload as unloadCycles } from '../sauce/cycles';
import { initialize as initializeActions, unload as unloadActions } from '../sauce/actions';
import { initialize as initializeSubscriptions, unload as unloadSubscriptions } from '../events/subscriptions';
import { capitalize } from 'lodash';
import { isCoreKey } from '../utils/isCoreKey';
var three = require('three');

function make(config, name, canvasMaybe, initializer){
	if (!config) {
		console.warn('no renderers defined')
		return;
	}
	let onFinished = initializer.register(`renderers_${name}`)
	let args = config.get('args') && config.get('args').toJS() || {};
	args.canvas = canvasMaybe;

	let renderer = new three[config.get('type') || 'WebGLRenderer'](args);
  let actions = initializeActions(renderer, config);

  if (canvasMaybe) {
  	renderer.setSize = function(width, height){
  		let ext = this.context.getExtension('STACKGL_resize_drawingbuffer')
			ext.resize(width, height)
  	}
  }

  let rendererConfig = {};
  config.map((property, name) => {
    if (isCoreKey(name)) return;
    let func = renderer[`set${capitalize(name)}`];
    let unwrapped = property && property.toJS ? property.toJS() : property;
    if (typeof func == 'function') func.apply(renderer, [].concat(unwrapped))
    else renderer[`${capitalize(name)}`] = unwrapped;
  });

  let cycles = initializeCycles(renderer, config);
  let subscription = initializeSubscriptions(renderer, config, initializer);

	const specifiedString = config.get('dom');
	const parentElement = initializer.el;
  if (parentElement && typeof document !== 'undefined') {
    const element = parentElement || document.body;
    const queryString = typeof specifiedString == 'string' && specifiedString;
    const parent = queryString && element.querySelector(queryString) ? element.querySelector(queryString) : element;

    if(!parent){ console.warn(`could not find element with query selector ${queryString}`)}
    renderer.domElement.oncontextmenu = function (e) {
        e.preventDefault();
    };
    parent.appendChild( renderer.domElement )
  }


	onFinished.finished({ subscription, cycles, actions });
  return renderer
}

function unmake(renderer) {
		if( renderer.domElement && renderer.domElement.parentElement ){
		  renderer.domElement.parentElement.removeChild( renderer.domElement )
		}
		renderer.context = null;
		renderer.domElement = null;
		unloadActions(renderer);
		unloadCycles(renderer);
	  unloadSubscriptions(renderer);
}

export { make, unmake }
