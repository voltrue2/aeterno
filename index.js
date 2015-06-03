#!/usr/bin/env node

'use strict';

var modName = require('./lib/modname');
var exec = require('./lib/exec');

exports.setName = function (name) {
	modName.set(name);
};

exports.run = function (cb) {
	exec.appPath = module.parent.filename;
	exec.run(cb);
};
