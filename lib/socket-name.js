'use strict';

var modName = require('./modname');

module.exports = function (path, name) {
	if (!path) {
		throw new Error('Invalid application path given: ' + path);
	}
	var sockName = '/tmp/' + (name || modName.get()) + '-monitor-' + path.replace(/\//g, '-') + '.sock';
	return sockName;
};
