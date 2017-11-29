import { expect, assert } from 'chai';
import { Cycle } from '../../../source/sauce/cycles/cycle_types'

describe('Cycle', () => {
  const startFunc = function() { return 0.5; };
  const pauseValFunc = function() { return 0.5; };
  const waitFunc = function() { return 1.0; };
  const pauseFunc = function() { return 1.0; };
  const unPauseFunc = function() { return 1.0; };
  const resetFunc = function() { return 1.0; };

  const simpleCycle = {
    startValue: 0.1,
    pauseValue: 0.5,
    min: 0.0,
    max: 1.0,
    duration: 100,
    pauseDuration: 10,
    waitDuration: 100
  }
  const complexCycle = {
    startValue: startFunc,
    pauseValue: pauseValFunc,
    min: 0.0,
    max: 1.0,
    direction: -1,
    duration: 100,
    pauseDuration: 10,
    waitDuration: 100,
    onWait: waitFunc,
    onPause: pauseFunc,
    onUnPause: unPauseFunc,
    onReset: resetFunc
  }

  describe('a normal cycle', ()=>{
    let source = new Cycle(simpleCycle)

  })

})
