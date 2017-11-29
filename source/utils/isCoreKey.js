const CORE_KEYS = [
	'subscriptions',
	'cycles',
	'broadcasts',
	'uniforms',
	'attributes',
	'behaviors',
	'properties',
	'defines',
	'textures',
	'material',
	'actions'
]
const CORE_CONFIGS = [
	'environment',
	'behaviors',
	'compositions',
	'frame_buffers',
	'materials',
	'objects',
	'renderers',
	'scenes',
	'sources',
	'origins'
]

const IGNORED_FILES = [
	'.DS_STORE'
]

function isCoreKey( value ){
	if(CORE_KEYS.indexOf(value) >= 0) return true
	return false
}

function isCoreConfig( value ){
	if(CORE_CONFIGS.indexOf(value) >= 0) return true
	return false
}

function shouldIgnoreFile(value) {
	if(IGNORED_FILES.indexOf(value) >= 0) return true
	return false
}

export { isCoreKey, isCoreConfig, shouldIgnoreFile }
