import gl from 'gl';

function make(config){
	let canvas;

	if (typeof document == 'undefined') {
		let width = config.get('width');
		let height = config.get('height');
		let args = config.delete('width');
		args = args.delete('height');

		let glContext = gl(width, height, args.toJS && args.toJS());

		canvas = {
			getContext: function(){ return glContext }
		}
	}

	return canvas;
}

export { make };
