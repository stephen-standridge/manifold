import { fromJS } from 'immutable';
var three = require('three');

const frame_buffer = function(config=fromJS({})){
	let material = fromJS({
		defines: {
			resolution: `vec2(${ config.getIn(['renderer', 'size', 0]) || 128 }, ${ config.getIn(['renderer', 'size', 1]) || 128})`
		},
		type: 'ShaderMaterial',
		vertexShader: [
			"void main() {",
				"	gl_Position = vec4( position, 1.0 );",
			"}",
		].join("\n"),
		fragmentShader: [
			"void main() {",
				"vec2 uv = gl_FragCoord.xy / resolution.xy;",
				"gl_FragColor = vec4(1.0);",
			"}",
		].join("\n")
	}).mergeDeep(config.get('material'))
	return fromJS({
		renderer: {
			dom: false,
			type: 'WebGLRenderer',
			size: [128, 128]
		},
		camera: {
			type: 'OrthographicCamera',
			arguments: [-1, 1, 1, -1, 0, 1]
		},
		scene: {
			children: [
				{
					type: 'Mesh',
					arguments: [new three.PlaneBufferGeometry(2, 2), null],
					material: material.toJS()
				}
			]
		},
		actions: {
			get_material: function() {
				return this.scene.children[1].material;
			},
			update_material: function(newMaterial) {
				this.scene.children[1].material = newMaterial;
			}
		},
		subscriptions: {
	    'frame.FRAME_BUFFER_RENDER': function action( e ){
				this.actions.render();
			}
		}
	}).mergeDeep(config.delete('material'));
}

const material = function(config=fromJS({})) {

	let m = fromJS({
		defines: { resolution: `vec2(${ config.getIn(['renderer', 'size', 0]) || 128}, ${ config.getIn(['renderer', 'size', 1]) || 128 })` },
		type: 'ShaderMaterial',
		vertexShader: [
			"void main() {",
				"	gl_Position = vec4( position, 1.0 );",
			"}",
		].join("\n"),
		fragmentShader: [
			"void main() {",
				"vec2 uv = gl_FragCoord.xy / resolution.xy;",
				"gl_FragColor = vec4(1.0);",
			"}",
		].join("\n")
	}).mergeDeep(config.get('material'))

	return fromJS({
		renderer: {
			dom: true,
			type: 'WebGLRenderer',
			size: [128, 128]
		},
		camera: {
			type: 'OrthographicCamera',
			arguments: [-1, 1, 1, -1, 0, 1]
		},
		scene: {
			children: [
				{
					type: 'Mesh',
					arguments: [new three.PlaneBufferGeometry(2, 2), null],
					material: m.toJS()
				}
			]
		},
		subscriptions: {
	    'frame.COMPOSITION_RENDER': function action( e ){
				this.actions.render();
			}
		}
	}).mergeDeep(config.delete('material'));
}

const render = function(config=fromJS({})) {
	let material = fromJS({
		defines: {
			resolution: `vec2(${ config.getIn(['renderer', 'size', 0]) || 128 }, ${ config.getIn(['renderer', 'size', 1]) || 128})`
		},
		type: 'ShaderMaterial',
		vertexShader: [
			"void main() {",
				"	gl_Position = vec4( position, 1.0 );",
			"}",
		].join("\n"),
		fragmentShader: [
			"void main() {",
				"vec2 uv = gl_FragCoord.xy / resolution.xy;",
				"gl_FragColor = vec4(1.0);",
			"}",
		].join("\n")
	}).mergeDeep(config.get('material'))
	return fromJS({
		renderer: {
			dom: true,
			type: 'WebGLRenderer',
			size: [128, 128]
		},
		scene: {
			children: [
				{
					type: 'Mesh',
					arguments: [new three.PlaneBufferGeometry(2, 2), null],
					material: material.toJS()
				}
			]
		},
		subscriptions: {
	    'frame.COMPOSITION_RENDER': function action( e ){
				this.actions.render();
			}
		}
	}).mergeDeep(config);
}


export { frame_buffer, material, render }
