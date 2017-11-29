module.exports = {
  // side: THREE.DoubleSide,
  // textures:{ 
  //   testMap: {
  //     generator: function(){return []},
  //     width: 256,
  //     height: 256,
  //     format: 'RGBAFormat',
  //     detail: 10,
  //     roughness: 10,
  //     height_range: [-0.5, 0.5],
  //     type: 'FloatType'      
  //   },
  //   testImage: {
  //     url: './assets/skybox.jpg'
  //   }
  // },  
  // uniforms:{
  //   exampleUniform : {
  //     generator: function({thisConfig}, {objectProperties}){ },
  //     type: "v2",    
  //   }  
  // },
  // vertexShader: [
  //   "varying vec3 pos;",
  //   "varying vec2 vUv;",
  //   "uniform sampler2D testMap;",

  //   "void main() {",
  //     "float height = texture2D(testMap,uv).a;",
  //     "vec4 calculatedPosition = vec4(position.x, position.y+height, position.z, 1.0);",
  //     "vec4 mvPosition = modelViewMatrix * calculatedPosition;",
  //     "gl_Position = projectionMatrix * mvPosition",
  //   "}",
  // ].join("\n"),

  // fragmentShader: [
  //   "precision mediump float;",
  //   "varying vec3 pos;",
  //   "varying vec2 vUv;",    
  //   "uniform sampler2D testImage;",

  //   "void main() {",
  //     "vec4 imageValue = texture2D(testImage, vUv);",
  //     "gl_FragColor = vec4(imageValue.xyz, 1.0);",
  //   "}",
  // ].join("\n")
};