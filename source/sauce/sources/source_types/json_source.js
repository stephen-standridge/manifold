import { Source } from './source';
import { fromJS, Map } from 'immutable';
import { load } from '../../../core/loaders';
var RX = require('rx');

class JsonSource extends Source {
	constructor(config, type, dataInitializer, url){
		if (!url) console.warn('cannot initialize an ajax source without a url');
		super(config, type, dataInitializer);
		this.url = url;
	}
	connect(onConnect) {
		let connector = onConnect && onConnect.bind(this) || this.onConnect.bind(this);
		/*
			for each attribute/uniform in this source (all attributes or uniforms)
		*/
		let setter = this.config.getIn(['data', this.type])

		let subscription = load(this.url).
			flatMap((data) => RX.Observable.from(data.body[this.type])).
			subscribe(this.register.bind(this),
				(e) => { console.error(e) },
				(item) => { subscription.dispose(); })
		connector();
	}
}

export { JsonSource }
