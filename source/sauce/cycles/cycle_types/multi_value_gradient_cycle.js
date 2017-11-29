import { Cycle } from './cycle';
import { lerp } from '../../../utils';

function createLookupValues(stops, resolution) {
  let colors = [], c = [], color1, color2, stop1, stop2, f;
  // Now read the gradient info and fill the buffer with BGRA colors.
  for(let i = 0; i < stops.length - 1; ++i ) {
    color1 = stops[i];
    color2 = stops[i + 1];

    if (color1.position < 0 || color1 > 1) { console.error(`multivalue cycle stop ${i} has a position outside of 0-1`); return; }
    if (color2.position < 0 || color2 > 1) { console.error(`multivalue cycle stop ${i+1} has a position outside of 0-1`); return; }
    if (color1.position >= color2.position ) { console.error(`multivalue cycle stop positions are out of order`); return; }

    // Convert float to a value between 0 and 255.
    stop1 = Math.floor(color1.position * (resolution - 1));
    stop2 = Math.floor(color2.position * (resolution - 1));
    for(let x = stop1; x <= stop2; ++x ) {
      // Calculate color.
      f = ( x - stop1 ) / ( stop2 - stop1 );
      c = color1.value.map((c, i) => {
      	return lerp(color1.value[i], color2.value[i], f);
      })
      // Convert to RGBA bytes and store in buffer.
      c.map((color, i) => {
      	colors[i] = colors[i] && colors[i].concat(color) || [].concat(color);
      })
    }
  }
  return colors;
}

class MultiValueGradientCycle extends Cycle {
  constructor( args, context ) {
    super(args, context);
    let { stops, resolution } = args;
    this.core.__stops = stops;
    this.core.__resolution = (resolution || 100) - 1;
    this.core.__type = 'gradient';
    resolution = this.core.__resolution + 1;
    this.core.__lookups = [];
    this.ready = false;
    if(!this.core.__stops[0].value.length) { console.error('no values defined for a cycle', this.core); return; }
    this.core.__lookups.length = this.core.__stops[0].value.length;
    setTimeout(function(){
      this.core.__lookups = createLookupValues(this.core.__stops, resolution)

      this.ready = true
    }.bind(this),0)
  }
  get current() {
    if (!this.ready) return this.core.__lookups.map(() => 0);
    return this.core.__lookups.map((l) => l[Math.round(this.t * this.core.__resolution)]);
  }
}

export { MultiValueGradientCycle };


