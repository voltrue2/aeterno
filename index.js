#!/usr/bin/env node

'use strict';

var modName = require('./lib/modname');
var exec = require('./lib/exec');
var parent = require('./lib/parent');
var appPath;

exports.setName = function (name) {
	modName.set(name);
};

exports.setApplicationPath = function (path) {
	appPath = path;
};

exports.run = function (cb) {
	/*
	by default aeterno will find the topmost file
	and use it as the execution script file path
	*/
	exec.appPath = appPath || parent.getTopmostParent();
	exec.run(cb);
};
