'use strict';

module.exports = function (path) {
	if (!path) {
		throw new Error('Invalid application path given: ' + path);
	}
	var sockName = '/tmp/aeterno-monitor-' + path.replace(/\//g, '-') + '.sock';
	return sockName;
};
