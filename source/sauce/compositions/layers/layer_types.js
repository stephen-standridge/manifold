import { fromJS } from 'immutable';

let texture_count = -1;

function current_texture_count(){
	texture_count++
	return texture_count
}

const gpgpu = function(config=fromJS({}), size=[128,128]){
	let s = config.getIn(['texture', 'size']) && config.getIn(['texture', 'size']).toJS() || size;
	let texture = fromJS({
		id: `GPGPU_TEXTURE_${current_texture_count()}`,
		size: s,
		// type: 'FloatType',
		format: 'RGBAFormat'
	});

	let renderTarget = {
		size: s,
		minFilter: 'NearestFilter',
		magFilter: 'NearestFilter'
	}

	let material = {
		type: 'ShaderMaterial',
		defines: { resolution: `vec2(${ s[0] },${ s[1] })`},

		vertexShader: [
			"void main() {",
				"	gl_Position = vec4( position, 1.0 );",
			"}",
		].join("\n"),
		fragmentShader: [
			"void main() {",
				"gl_FragColor = vec4(0.5);",
			"}",
		].join("\n")
	}

	let initialValue = {
		material: {
			type: 'ShaderMaterial',
			defines: { resolution: `vec2(${ s[0] },${ s[1] })`},

			vertexShader: [
				"void main() {",
					"	gl_Position = vec4( position, 1.0 );",
				"}",
			].join("\n"),
			fragmentShader: [
				"void main() {",
					"gl_FragColor = vec4(0.0);",
				"}",
			].join("\n")
		}
	}

	return fromJS({
		renderTarget: renderTarget,
		material: material,
		initialValue: initialValue,
		texture: texture,
		camera: {
			type: 'OrthographicCamera',
			arguments: [-1, 1, 1, -1, 0, 1]
		}
	}).mergeDeep(config)
}

const render = function(config=fromJS({})){
	return config
}

const texture = function(config=fromJS({}), size=[128,128]){
	let s = config.getIn(['texture', 'size']) && config.getIn(['texture', 'size']).toJS() || size;

	let texture = fromJS({
		id: `RENDER_TEXTURE_${current_texture_count()}`,
		size: s,
		// type: 'FloatType',
		format: 'RGBAFormat'
	}).mergeDeep(config.get('texture'));

	let renderTarget = {
		size: s,
		minFilter: 'NearestFilter',
		magFilter: 'NearestFilter'
	}

	return fromJS({
		renderTarget: renderTarget,
		texture: texture.toJS(),
		camera: {
			type: 'OrthographicCamera',
			arguments: [-1, 1, 1, -1, 0, 1]
		}
	}).mergeDeep(config.delete('texture'))
}

const material = function(config=fromJS({}), size=[128,128]){
	let s = config.getIn(['texture', 'size']) && config.getIn(['texture', 'size']).toJS() || size;

	let renderTarget = {
		size: s,
		minFilter: 'NearestFilter',
		magFilter: 'NearestFilter'
	}

	return fromJS({
		renderTarget: renderTarget,
		camera: {
			type: 'OrthographicCamera',
			arguments: [-1, 1, 1, -1, 0, 1]
		}
	}).mergeDeep(config)
}
export { gpgpu, render, material, texture }
