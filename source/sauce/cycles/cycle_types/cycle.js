class Cycle {
	constructor( args, context ){
		let { startValue, pauseValue, min, max, direction, repeat,
					duration, pauseDuration, waitDuration,
					onWait, onPause, onUnPause, onReset, onPlay, onStart } = args;
		pauseValue = typeof pauseValue == 'function' ? (context && pauseValue.bind(context) || pauseValue) :
								 typeof pauseValue == 'number' ? pauseValue : false;
		this.core = {
			__playDuration    : duration || 1000,
			__pauseDuration   : pauseDuration || 0,
			__pauseValue 			: pauseValue,
			__pausedAt  			: 0,
			__waitDuration 		: waitDuration || 0,
			__waitProgress    : 0,
			__state     			: 'NEW',
			__last      			: 0,
			__pauseKey  			: false,
			__waiting     		: false,
			__min							: typeof min == 'number' && min || 0.0,
			__max							: typeof max == 'number' && max || 1.0,
			__onWait					: context ? onWait && onWait.bind(context) : onWait,
			__onPause					: context ? onPause && onPause.bind(context) : onPause,
			__onPlay					: context ? onPlay && onPlay.bind(context) : onPlay,
			__onUnPause				: context ? onUnPause && onUnPause.bind(context) : onUnPause,
			__onReset					: context ? onReset && onReset.bind(context) : onReset,
			__onStart					: context ? onStart && onStart.bind(context) : onStart,
			__pauseProgress  	: 0.0,
			__playDirection		: direction || 1.0,
			__repeat					: repeat || 'loop'
		}

		startValue = typeof startValue == 'function' ? (context && startValue.call(context, this.core) || startValue(this.core)) : startValue;

		this.core = this.transitionCore(this.core, { type: 'START', startValue });
	}
	get current() {
		return this.t
	}
	get t() {
		if (this.core.__state == 'PLAYING' || this.core.__state == 'WAITING' ) {
			return this.core.__from + ((this.core.__to - this.core.__from) * this.core.__playProgress);
		} else if (this.core.__state == 'PAUSED' || this.core.__state == 'UNPAUSED') {
			return this.core.__from + ((this.core.__to - this.core.__from) * this.core.__pauseProgress);
		}
	}
	update(time){
		switch(this.core.__state){
			case 'PAUSED':
				if (this.core.__pauseProgress >= 1.0) return;
				this.core = this.transitionCore( this.core, { type: 'PAUSE_TICK', time });
				break;
			case 'UNPAUSED':
				this.core = this.transitionCore( this.core, { type: 'PAUSE_TICK', time });
				if(this.core.__pauseProgress >= 1.0 ){
					return this.transitionCore(this.core, { type: 'PLAY' });
				}
				break;
			case 'WAITING':
				this.core = this.transitionCore( this.core, { type: 'WAIT_TICK', time });
				while( this.core.__waitProgress >= 1.0 ){
					return this.transitionCore( this.core, { type: 'RESET' })
				}
				break;
			default:
				this.core = this.transitionCore( this.core, { type: 'PLAY_TICK', time });
				if( this.core.__playProgress >= 1.0 || this.core.__playProgress <= 0.0 ){
	 				return this.transitionCore( this.core, { type: 'WAIT' });
				}
				break;
		}
	}
	withCallback(callback, time) {
		this.update(time);
		callback(this.current);
	}
	pause(key=false){
		if(this.core.__state == 'PAUSED') return;
		this.core = this.transitionCore(this.core, { type: 'PAUSE', key })
	}
	unpause(key=false){
		if(this.core.__state == 'UNPAUSED') return;
		if(this.core.__pauseKey == key){
			this.core = this.transitionCore(this.core, { type: 'UNPAUSE', key})
		}
	}
	pauseToggle(key=false){
		if(this.core.__state == 'PAUSED') return this.unpause( key );
		return this.pause(key)
	}
	play(){
		if(this.core.__state == 'PLAYING') return;
		this.core = this.transitionCore(this.core, { type: 'PLAY' })
	}
	reverse() {
		this.transitionCore(this.core, { type: 'REVERSE' })
	}
	backward(){
		this.transitionCore(this.core, { type: 'BACKWARD' })
	}
	forward(){
		this.transitionCore(this.core, { type: 'FORWARD' })
	}
	transitionCore( core, action ){
		switch( action.type ){
			case 'START':
				if(core.__onStart ) 		{ core.__onStart() }
				core.__state      			= 'PLAYING';
				core.__last    	  			= Date.now();
				core.__from       			= core.__min;
				core.__to 							= core.__max;
				core.__playProgress   	= (typeof action.startValue == 'number' ? action.startValue : core.__from) / core.__to;
				if(core.__onPlay ) 			{ core.__onPlay() }
				break;
			case 'PLAY':
				if(core.__onPlay ) 			{ core.__onPlay() }
				core.__from       			= core.__min;
				core.__to 							= core.__max;
				core.__state      			= 'PLAYING';
				break;
			case 'PAUSE':
				if(core.__onPause ) 		{ core.__onPause() }
				core.__pauseProgress  	= 0.0;
				core.__from       			= core.__playProgress
				if (core.__pauseValue !== false) {
					core.__to 						= core.__pauseValue.call && core.__pauseValue(core) || core.__pauseValue;
				} else {
					core.__to 						= core.__playProgress
				}
				core.__pauseKey   			= action.key || false;
				core.__state      			= 'PAUSED';
				break;
			case 'UNPAUSE':
				if(core.__onUnPause ) 	{ core.__onUnPause() }
				core.__from      		 		= core.__from + ((core.__to - core.__from) * core.__pauseProgress)
				core.__to 							= core.__playProgress;
				core.__pauseProgress  	= 0.0;
				core.__pauseKey   			= false;
				core.__state      			= 'UNPAUSED';
				break;
			case 'RESET':
				if(core.__onReset ) 		{ core.__onReset() }
				core.__waitProgress 		= 0.0;
				core.__state 						= 'PLAYING'
				if (core.__repeat == 'reflect') {
					core.__playDirection 	*= -1.0
				} else {
					core.__playProgress 	= 0.0;
				}
				break;
			case 'BACKWARD':
				this.__playDirection 		= -1.0;
				break;
			case 'FORWARD':
				this.__playDirection 		= 1.0;
				break;
			case 'REVERSE':
				this.__playDirection 		= this.__playDirection * -1.0;
				break;
			case 'WAIT':
				if(core.__onWait && !core.__waiting ){ core.__onWait() }
				core.__playProgress			= Math.min(Math.max(core.__playProgress, core.__min), core.__max);
				core.__state      			= 'WAITING';
				break;
			case 'WAIT_TICK':
				core.__waitProgress    	+= (core.__tick / core.__waitDuration)
				break;
			case 'PAUSE_TICK':
				core.__tick 				 		= action.time - core.__last;
				core.__pauseProgress 		+= (core.__tick / core.__pauseDuration);
				core.__last 				 		= action.time;
				break;
			case 'PLAY_TICK':
				core.__tick 						= action.time - core.__last;
				core.__playProgress			+= (core.__tick / core.__playDuration) * core.__playDirection;
				core.__last 						= action.time;
				break;
			default:
				break;
		}
		return core;
	}
}

export { Cycle }
