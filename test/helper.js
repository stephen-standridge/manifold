import immutable from 'immutable';
import chai from 'chai';
import sinon from 'sinon';

// function stub(obj, target) {
//   var cls = (typeof obj == 'function') ? obj.prototype : obj;
//   target = target || {};

//   Object.getOwnPropertyNames(cls).filter(function(p){
//     return typeof cls[p] == 'function';
//   }).forEach(function(p) { target[p] = sinon.stub() });

//   return cls.__proto__ ? stub(cls.__proto__, target) : target;
// };


// global.THREE = stub(THREE)
global.fromJS = immutable.fromJS;
global.assert = chai.assert;
global.expect = chai.expect;





