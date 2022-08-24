import pjson from '../../package.json'
import { isCoreConfig, shouldIgnoreFile } from '../utils/isCoreKey';
const { fromJS, Map } = require('immutable');

const configType = process.env.CONFIG_ENV || false;

export default function () {
	let returned = Map({}), split, trimmed;

	if (process.env.IS_WEBPACK) {
		let requireContext = require.context("../../configuration", true, /^\.\/.*\.js$/);
		let environmentDirMaybe, environmentConfigMaybe;
		requireContext.keys().map((item, index) => {
			split = item.split('.js');
			trimmed = split[0].split('./')[1]
			environmentDirMaybe = trimmed.split('/')[0];
			environmentConfigMaybe = trimmed.split('/');
			environmentConfigMaybe.shift();
			environmentConfigMaybe = environmentConfigMaybe.join('/');
			if (environmentConfigMaybe !== 'origins') {
				let parts = trimmed.split('/')
				returned = returned.setIn(parts, fromJS(requireContext(item, index)))
			} else if (environmentDirMaybe == configType) {
				let parts = environmentConfigMaybe.split('/')
				returned = returned.setIn(parts, fromJS(requireContext(item, index)))
			}
		});
	} else {
		let requireAll = require('require.all');
		let path = require('path');
		let normalizedPath = path.join(__dirname, "../../configuration");
		require("fs").readdirSync(normalizedPath).forEach(function (file) {
			split = file.split('.js');
			trimmed = split[0];
			if (split.length == 2) {
				let parts = trimmed.split('/')
				let requiredPath = path.join(normalizedPath, file);
				returned = returned.setIn(parts, fromJS(require(requiredPath)));
			} else {
				let requiredPath = path.join(normalizedPath, file + '/');
				let requireContext = requireAll(requiredPath);
				Object.keys(requireContext).map((key) => {
					if (shouldIgnoreFile(key)) return;
					returned = returned.setIn([file, key], fromJS(requireContext[key]))
				})
			}
		})
	}

	returned = returned.set("ManifoldVersion", pjson.version);
	return returned
}

