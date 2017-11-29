import { Cycle } from './cycle';
import * as interpolations from '../../../utils';

class WaveCycle extends Cycle {
  constructor( args, context ) {
    super(args, context);
    let { wave, type, resolution } = args;
    let { ampletude, period, offset, shift } = wave;
    this.core.__resolution = (resolution || 100) - 1;
    this.core.__wave = {};
    this.core.__wave.ampletude = ampletude || 1.0;
    this.core.__wave.period = period || 1.0;
    this.core.__wave.offset = offset || 0.0;
    this.core.__wave.shift = shift || 0.0;
    this.core.__type = type;
    let createLookupValue;
    switch (type) {
      case 'sine':
        createLookupValue = interpolations.wave;
      break;
      case 'square':
        createLookupValue = interpolations.square;
      break;
      case 'triangle':
        createLookupValue = interpolations.triangle;
      break;
      case 'saw':
        createLookupValue = interpolations.saw;
      break;
    }

    ampletude = this.core.__wave.ampletude;
    period = this.core.__wave.period;
    offset = this.core.__wave.offset;
    shift = this.core.__wave.shift;
    resolution = this.core.__resolution + 1;
    this.core.__lookup = [];
    this.ready = false;
    setTimeout(function(){
      for (let i = 0; i< resolution; i++) {
        this.core.__lookup[i] = createLookupValue(period, ampletude, offset, shift, i/resolution)
      }
      this.ready = true
    }.bind(this),0)
  }
  get current() {
    if (!this.ready) return 0;
    return this.core.__lookup[Math.round(this.t * this.core.__resolution)];
  }
}

export { WaveCycle }
