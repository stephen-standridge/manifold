import { WRAPPING_MODES, FILTER_TYPES, TEXTURE_FORMATS, TEXTURE_TYPES } from '../../core/constants';
import { construct } from '../../utils/constructor';

function make(configuration, rendererSize) {
	if (!configuration || !configuration.get) return
	let config = configuration.get('renderTarget') && configuration.get('renderTarget').toJS() || {};
	let size = config.size || configuration.getIn(['texture, size']) || rendererSize;
	delete config.size;

	let wrapS = WRAPPING_MODES[config.wrapS || 'ClampToEdgeWrapping'],
			wrapT = WRAPPING_MODES[config.wrapT || 'ClampToEdgeWrapping'],
			minFilter = FILTER_TYPES[config.minFilter || 'NearestFilter'],
			magFilter = FILTER_TYPES[config.magFilter || 'NearestFilter'],
			format = TEXTURE_FORMATS[config.format || 'RGBAFormat'],
			type,
			// type = TEXTURE_TYPES[config.type || ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? 'HalfFloatType' : 'FloatType'],
			stencilBuffer = config.stencilBuffer || false;
	return construct(config.type || 'WebGLRenderTarget', [size[0], size[1], { wrapS, wrapT, minFilter, magFilter, format, type, stencilBuffer }])
}

export { make }
