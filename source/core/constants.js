var three = require('three');

export const TEXTURE_WRAPPINGS = {
	'RepeatWrapping': three.RepeatWrapping,
	'ClampToEdgeWrapping': three.ClampToEdgeWrapping,
	'MirroredRepeatWrapping': three.MirroredRepeatWrapping
}

export const TEXTURE_TYPES = {
	'UnsignedByteType': three.UnsignedByteType,
	'ByteType': three.ByteType,
	'ShortType': three.ShortType,
	'UnsignedShortType': three.UnsignedShortType,
	'IntType': three.IntType,
	'UnsignedIntType': three.UnsignedIntType,
	'FloatType': three.FloatType,
	'HalfFloatType': three.HalfFloatType,
	'UnsignedShort4444Type': three.UnsignedShort4444Type,
	'UnsignedShort5551Type': three.UnsignedShort5551Type,
	'UnsignedShort565Type': three.UnsignedShort565Type
}

export const TEXTURE_FORMATS = {
	'RGBAFormat': three.RGBAFormat,
	'RGBFormat': three.RGBFormat,
	'AlphaFormat': three.AlphaFormat,
	'LuminanceFormat': three.LuminanceFormat,
	'LuminanceAlphaFormat': three.LuminanceAlphaFormat
}

export const ARRAY_TYPES = {
	'Float32Array': Float32Array,
	'Float64Array': Float64Array,
	'Int8Array': Int8Array,
	'Uint8Array': Uint8Array,
	'Uint8ClampedArray': Uint8ClampedArray,
	'Int16Array': Int16Array,
	'Uint16Array': Uint16Array,
	'Int32Array': Int32Array,
	'Uint32Array': Uint32Array
}

export const FILTER_TYPES = {
	'NearestFilter': three.NearestFilter,
	'NearestMipMapNearestFilter': three.NearestMipMapNearestFilter,
	'NearestMipMapLinearFilter': three.NearestMipMapLinearFilter,
	'LinearFilter': three.LinearFilter,
	'LinearMipMapNearestFilter': three.LinearMipMapNearestFilter,
	'LinearMipMapLinearFilter': three.LinearMipMapLinearFilter
}

export const WRAPPING_MODES = {
	'RepeatWrapping': three.RepeatWrapping,
	'ClampToEdgeWrapping': three.ClampToEdgeWrapping,
	'MirroredRepeatWrapping': three.MirroredRepeatWrapping
}

export const MAPPING_MODES = {
	'UVMapping': three.UVMapping,
	'CubeReflectionMapping': three.CubeReflectionMapping,
	'CubeRefractionMapping': three.CubeRefractionMapping,
	'EquirectangularReflectionMapping': three.EquirectangularReflectionMapping,
	'EquirectangularRefractionMapping': three.EquirectangularRefractionMapping,
	'SphericalReflectionMapping': three.SphericalReflectionMapping,
	'CubeUVReflectionMapping': three.CubeUVReflectionMapping,
	'CubeUVRefractionMapping': three.CubeUVRefractionMapping
}

export const LOADER_TYPES = {
	'json' : {
		responseType: 'json'
	},
	'png' : {
		responseType: 'image'
	},
	'jpeg' : {
		responseType: 'image'
	}
}
