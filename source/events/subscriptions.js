import { get as getEvent } from './events';
import { prepareObject } from '../utils/prepare'
var RX = require('rx');

function initialize(context, configuration, initializer) {
	if (!configuration || !configuration.get) return;
	let config = configuration.get('subscriptions');
	if (!config) return;
	let controlled = configuration.get('controlled');

	prepareObject(context, 'subscriptions');

	let pauser = controlled ? new RX.Subject() : null;

	config.forEach((action, name) => {
		if (name == 'controlled') return;
		let e = getEvent(name, initializer.withEventFiltering && initializer.name);
		if (typeof e == 'undefined') {
			console.warn(`The event ${name} has not been defined yet. Perhaps you should define it.`);
			return;
		} else if (!e) {
			return;
		}

		let event = controlled ? pauser.switchMap(paused => paused ? Rx.Observable.never() : e).subscribeOnNext(action, context) : e.subscribeOnNext(action, context);

		context.subscriptions[name] = event
	});

	if (controlled) {

		context.subscriptions.pause = pauser.onNext.bind(pauser, true)
		context.subscriptions.unpause = pauser.onNext.bind(pauser, false)
	}

	return controlled ? {
		pause: pauser.onNext.bind(pauser, true),
		unpause: pauser.onNext.bind(pauser, false),
		list: context.subscriptions
	} : {
		list: context.subscriptions
	}
}

function unload(context) {
	context && context.subscriptions && Object.keys(context.subscriptions).forEach((k)=>{ context.subscriptions[k].dispose() })
	context && context.subscriptions && delete context.subscriptions
}

export { initialize, unload }
