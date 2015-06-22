#!/usr/bin/env node

'use strict';

var modName = require('./lib/modname');
var exec = require('./lib/exec');
var appPath;

exports.setName = function (name) {
	modName.set(name);
};

exports.setApplicationPath = function (path) {
	appPath = path;
};

exports.run = function (cb) {
	// module.parent.filename = file that requires aeterno
	exec.appPath = appPath || module.parent.filename;
	exec.run(cb);
};
