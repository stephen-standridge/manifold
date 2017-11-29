const controls = require('./manifold');
const environment = require('./environment');

module.exports = function(options, env, el){
  const Manifold = {};
  Manifold.load = controls.load
  Manifold.unload = controls.unload
  Manifold.initialize = controls.initialize

  Manifold.controllers = controls.getControllers;
  Manifold.configs = controls.getFromAllPrograms;
  Manifold.systems = controls.getSystems;
  Manifold.status = controls.getStatus;
  Manifold.start = controls.startProgram;
  Manifold.stop = controls.stopProgram;
  Manifold.ENV = environment.ENV

  Manifold.initialize(options, env, el);
  return Manifold
}
