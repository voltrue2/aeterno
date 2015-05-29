#!/usr/bin/env node

'use strict';

var exec = require('./lib/exec');

exports.run = function (cb) {
	exec.appPath = module.parent.filename;
	exec.run(cb);
};
