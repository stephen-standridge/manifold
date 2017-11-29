import { Cycle, WaveCycle, GradientCycle, MultiValueGradientCycle, MultiValueWaveCycle } from './cycle_types';
import { prepareObject } from '../../utils/prepare';
import { setAction } from '../actions';
import { List } from 'immutable';

function make(config, context) {
	if (!config) return;
	let cycle;

	switch(config.get('type')) {
		case 'sine':
		case 'square':
		case 'triangle':
		case 'saw':
			if (config.get('waves')) {
				cycle = new MultiValueWaveCycle(config.toJS());
			} else {
				cycle = new WaveCycle(config.toJS());
			}
		break;
		case 'gradient':
		default:
			if (List.isList(config.getIn(['stops', 0, 'value']))) {
				cycle = new MultiValueGradientCycle(config.toJS());
			} else if (config.get('stops'))  {
				cycle = new GradientCycle(config.toJS(), context);
			}	else {
				cycle = new Cycle(config.toJS(), context);
			}
		break;
	}


	return cycle;
}

function initialize(context, config) {
	if (!config || !config.get) return;
  if (!config.get('cycles')) return;
	prepareObject(context, 'cycles');
	let newActions = {};

  config.get('cycles').forEach((cycle, name) => {
  	let current = make(cycle, context);
		if (current) {
			context.cycles[name] = current;

			//if there is an action that has the same name, assume it should take this cycle value
			let response = context.actions[`update_${name}`] ?
				current.withCallback.bind(current, context.actions[`update_${name}`]) :
				current.update.bind(current);

			Object.assign(newActions, setAction(context, `update_${name}_cycle`, response));
		}
  })

  return newActions;
}

function unload(context) {
	context && context.cycles && delete context.cycles
}

export { make, initialize, unload }
