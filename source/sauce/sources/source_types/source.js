import { setAction } from '../../actions';
import { ARRAY_TYPES } from '../../../core/constants.js'
import { fromJS, List, Map } from 'immutable';

function update(value, name) {
	this.actions[`update_${name}`](() => new ARRAY_TYPES[value.type](value.array));
}

function identify(context, item) {
	return context.name == item.name || context.id == item.id;
}

class Source {
	constructor(config, type, dataInitializer){
		this.config = config.get ? config : fromJS(config);
		this.type = type;
		this.dataInitializer = dataInitializer;
		this.identifier = this.config.get('identify') || identify;
		this.toReconnect = [];
		this.updators = [];
		this.itemCache = List();
		this.onLink = this.config.getIn(['onLink', type]) || false;
		this.onConnect = this.config.getIn(['onConnect', type]) || false;
	}

	register(item) {
		this.itemCache = this.itemCache.push(item.toJS ? item : fromJS(item))
	}

	link(context, onLink) {
		/*
			sets all attributes/uniforms on the context
			adds this update action to its own reconnect cache
		*/
		if (!this.onLink && !onLink) { console.warn(`no onLink function found for ${type}`); return }
		let setter = onLink && onLink.bind(context) || this.onLink.bind(context);
		let found = this.itemCache.filter(this.identifier.bind(this, context)).get(0);

		this.dataInitializer(context, Map({ [this.type]: found.delete('name').delete('id') }), setter);

		let updators = Map({});
		found && found.forEach((value, key) => {
			if (key == 'name' || key == 'id') return;
			updators = updators.set(key, update.bind(context));
		})

		this.updators.push(updators);
		this.toReconnect.push(context);
	}

	relink(before, after) {
		typeof before == 'function' && before.call(this);

		for(let i = 0; i< this.toReconnect.length; i++) {
			let found = this.itemCache.filter(this.identifier.bind(this, this.toReconnect[i])).get(0);
			found && found.forEach((value, key) => {
				if (key == 'name' || key == 'id') return;

				this.updators[i].get(key)(value.toJS(), key)
			});
		}

		typeof after == 'function' && after.call(this);
	}

	connect(onConnect) {
		let connector = onConnect && onConnect.bind(this) || this.onConnect.bind(this);
		this.config.getIn(['data', this.type]).map(this.register.bind(this));
		connector && connector()
	}
}

export { Source }
