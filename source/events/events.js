import { Map } from 'immutable';
import { byString } from '../utils/by_string';
import { ENV_observables } from '../core/environment';
var RX = require('rx');
var RXDom = require('rx-dom');
let initializedEvents = false;
const Events = {};

function initialize(el, initializer){
	let targets,
			click = false,
			mousedown = false,
			mouseup = false,
			mousemove = false,
			touchstart = false,
			touchend = false,
			touchmove = false,
			_keyDowns = false,
			_keyUps = false,
			keyActions = false,
			windowResize = false;


	if (typeof document !== 'undefined') {
		targets = el;

		click = RX.Observable.fromEvent(targets, 'click');
		mousedown = RX.Observable.fromEvent(targets, 'mousedown');
		mouseup = RX.Observable.fromEvent(targets, 'mouseup');
		mousemove = RX.Observable.fromEvent(targets, 'mousemove');
		touchstart = RX.Observable.fromEvent(targets, 'touchstart');
		touchend = RX.Observable.fromEvent(targets, 'touchend');
		touchmove = RX.Observable.fromEvent(targets, 'touchmove');
		_keyDowns = RXDom.Observable.fromEvent(document, 'keydown');
		_keyUps = RXDom.Observable.fromEvent(document, 'keyup');
		keyActions = RX.Observable.merge(_keyDowns, _keyUps);

		windowResize = RXDom.Observable.fromEvent(window, 'resize').debounce(200);
	}

	const animationFrame = RX.Observable.interval(RX.Scheduler.requestAnimationFrame).timestamp();

	const pauser = new RX.Subject();
	const observableFrame = RX.Observable.create(observer => {
		pauser.onNext(true);
	  // Yield a single value and complete
		// Events.pausableAnimationFrame.pause();
	  observer.onNext('FRAME_START');
	  observer.onNext('UPDATE');
	  observer.onNext('FRAME_BUFFER_RENDER');
	  observer.onNext('COMPOSITION_RENDER');
	  observer.onNext('FRAME_END');
	  observer.onCompleted();
	  return () => pauser.onNext(false);
	}).timestamp();
	const pausableAnimationFrame = pauser.switchMap(paused => {
		return paused ? RX.Observable.never() : animationFrame
	})
	const _frame = animationFrame.skipUntil(pauser).concatMap(() => observableFrame).share()
	Events._frame = _frame;

	Events.windowResize = windowResize;
	Events.keyActions = keyActions;
	Events.animationFrame = animationFrame;
	Events.click = click;
	Events.mousedown = mousedown;
	Events.mouseup = mouseup;
	Events.mousemove = mousemove;
	Events.touchstart = touchstart;
	Events.touchend = touchend;
	Events.touchmove = touchmove;

	Events.keyDowns = {
		"shift": 			_keyDowns && _keyDowns.filter(e => e.keyCode == 16),
		">": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 190),
		"<": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 188),
		"shift<": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 188 && e.shiftKey),
		"shift/": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 191 && e.shiftKey),
		"/": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 191),
		"space": 			_keyDowns && _keyDowns.filter(e=> e.code == 'Space'),
		"shiftUp": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 38 && e.shiftKey),
		"shiftDown": 	_keyDowns && _keyDowns.filter(e => e.keyCode == 40 && e.shiftKey),
		"shiftLeft": 	_keyDowns && _keyDowns.filter(e => e.keyCode == 37 && e.shiftKey),
		"shiftRight": _keyDowns && _keyDowns.filter(e => e.keyCode == 39 && e.shiftKey),
		"-": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 189 && !e.shiftKey),
		"=": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 187 && !e.shiftKey),
		"shift-": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 189 && e.shiftKey),
		"shift=": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 187 && e.shiftKey),
		"up": 				_keyDowns && _keyDowns.filter(e => e.keyCode == 38 && !e.shiftKey),
		"down": 			_keyDowns && _keyDowns.filter(e => e.keyCode == 40 && !e.shiftKey),
		"left": 			_keyDowns && _keyDowns.filter(e => e.keyCode == 37 && !e.shiftKey),
		"right": 			_keyDowns && _keyDowns.filter(e => e.keyCode == 39 && !e.shiftKey),
		"shiftS": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 83 && e.shiftKey),
		"shiftW": 		_keyDowns && _keyDowns.filter(e => e.keyCode == 87 && e.shiftKey),
		"s": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 83 && !e.shiftKey),
		"w": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 87 && !e.shiftKey),
		"a": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 65 && !e.shiftKey),
		"d": 					_keyDowns && _keyDowns.filter(e => e.keyCode == 68 && !e.shiftKey),
	};

	Events.keyUps = {
		"shift": 			_keyUps && _keyUps.filter(e => e.keyCode == 16),
		">": 					_keyUps && _keyUps.filter(e => e.keyCode == 190),
		"<": 					_keyUps && _keyUps.filter(e => e.keyCode == 188),
		"shift<": 		_keyUps && _keyUps.filter(e => e.keyCode == 188 && e.shiftKey),
		"shift/": 		_keyUps && _keyUps.filter(e => e.keyCode == 191 && e.shiftKey),
		"/": 					_keyUps && _keyUps.filter(e => e.keyCode == 191 ),
		"space": 			_keyUps && _keyUps.filter(e=> e.code == 'Space')
	}

	Events.frame = {
		'FRAME_START': 					_frame.filter( e => e.value == 'FRAME_START'),
		'UPDATE': 							_frame.filter( e => e.value == 'UPDATE'),
		'FRAME_BUFFER_RENDER': 	_frame.filter( e => e.value == 'FRAME_BUFFER_RENDER'),
		'COMPOSITION_RENDER': 	_frame.filter( e => e.value == 'COMPOSITION_RENDER'),
		'FRAME_END': 						_frame.filter( e => e.value == 'FRAME_END')
	}

	Events.programs = {}
	Events.stop = stop.bind(pauser)
	Events.start = start.bind(pauser)

	initializedEvents = true;
	initializer.finished( null, Events)
}

function createEventStream(type) {
	const isManifold = type == 'manifold';
	if (isManifold) return;

	connect(isManifold ? ENV_observables : ENV_observables[type], !isManifold && type);

	const FPS = (ENV_observables[type] && ENV_observables[type].FPS) ?  ENV_observables[type].FPS.value : 60;
	const FPS_MS = 1000/FPS;
	const programPauser = new RX.Subject();
	const _pauseableFrame = programPauser.switchMap(paused => {
		return paused ? RX.Observable.never() : Events._frame
	})
	Events.programs[type] = {
		programPauser,
		_pauseableFrame,
		start: start.bind(programPauser),
		stop: stop.bind(programPauser)
	};
	Events.programs[type].frame = {
		'FRAME_START': 					Events.programs[type]._pauseableFrame.filter( e => e.value == 'FRAME_START').throttle(FPS_MS),
		'UPDATE': 							Events.programs[type]._pauseableFrame.filter( e => e.value == 'UPDATE').throttle(FPS_MS),
		'FRAME_BUFFER_RENDER': 	Events.programs[type]._pauseableFrame.filter( e => e.value == 'FRAME_BUFFER_RENDER').throttle(FPS_MS),
		'COMPOSITION_RENDER': 	Events.programs[type]._pauseableFrame.filter( e => e.value == 'COMPOSITION_RENDER').throttle(FPS_MS),
		'FRAME_END': 						Events.programs[type]._pauseableFrame.filter( e => e.value == 'FRAME_END').throttle(FPS_MS)
	}

	return Events.programs[type];
}

function deleteEventStream(type) {
	Events.programs[type] && delete Events.programs[type];
}

function start() {
	this.onNext(false)
}

function stop() {
	this.onNext(true)
}

function connect( ENV_observables, program ) {
	Events.ENV = Events.ENV || {};
	Events.ENV = Object.assign(Events.ENV, program ? { [program]: ENV_observables } : ENV_observables)
}

function disconnect( program ) {
	if (program) delete Events.ENV[program];
	else delete Events.ENV;
}

function get(name, program) {
	if(!initializedEvents){ console.warn('cant subscribe to events until theyre initialized'); return }
	if (program) {
		if (name.split('.')[0] == 'frame') return byString(Events, `programs.${program}.${name}`);
		if (name.split('.')[0] == 'ENV') {
			let found = byString(Events, `ENV.${program}.${name.split('.')[1]}`);;
			if (found) return found;
			return byString(Events, name);
		}
	}

	return byString(Events, name);
}

export { initialize, get, connect, disconnect, start, stop, createEventStream, deleteEventStream }



