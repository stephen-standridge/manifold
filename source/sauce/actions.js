import { prepareObject } from '../utils/prepare';

function initialize(context, configuration) {
	prepareObject(context, 'actions');
 	if (!configuration || !configuration.get) return;
  if (!configuration.get('actions')) return;
  const config = configuration.get('actions')
  config.forEach((action, name) => setAction(context, name, action));
  return context.actions
}

function unload(context) {
	context && context.actions && delete context.actions;
}

function setAction(context, name, action) {
	prepareObject(context, 'actions');
	if (context.actions[name]) return context.actions[name];
	let newAction = { [name]: action.bind(context) };
	Object.assign(context.actions, newAction);
	return newAction;
}

export { setAction, initialize, unload };
