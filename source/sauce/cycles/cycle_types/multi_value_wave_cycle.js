import { Cycle } from './cycle';
import * as interpolations from '../../../utils';

class MultiValueWaveCycle extends Cycle {
  constructor( args, context ) {
    super(args, context);
    let { waves, type, resolution } = args;
    this.core.__resolution = (resolution || 100) - 1;
    this.core.__waves = waves.map((wave)=>{
    	return {
	  		ampletude: wave.ampletude || 1.0,
	  		period: wave.period || 1.0,
	  		offset: wave.offset || 0.0,
	  		shift: wave.shift || 0.0
	  	}
    })
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
    resolution = this.core.__resolution + 1;

    this.ready = false;
    this.core.__lookups = [];
    if(!this.core.__waves.length) { console.error('no values defined for a cycle', this.core); return; }
    this.core.__lookups.length = this.core.__waves.length;
    setTimeout(function(){
      this.core.__lookups = this.core.__waves.map((wave)=>{
        let { period, ampletude, offset, shift } = wave;
        let lookup = [];
        for (let i = 0; i< resolution; i++) {
          lookup[i] = createLookupValue(period, ampletude, offset, shift, i/resolution)
        }
        return lookup
      })
      this.ready = true
    }.bind(this),0)


  }
  get current() {
    if (!this.ready) return this.core.__lookups.map(() => 0);
    return this.core.__lookups.map((l) => l[Math.round(this.t * this.core.__resolution)]);
  }
}

export { MultiValueWaveCycle }
