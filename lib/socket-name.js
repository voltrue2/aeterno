'use strict';

var modName = require('./modname');

module.exports = function (path) {
	if (!path) {
		throw new Error('Invalid application path given: ' + path);
	}
	var sockName = '/tmp/' + modName.get() + '-monitor-' + path.replace(/\//g, '-') + '.sock';
	return sockName;
};
