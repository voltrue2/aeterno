'use strict';

var log = require('gracelog');
var logger;
var modName = require('./modname');

module.exports = Log;

function Log(path) {
	this._path = path;
}

Log.prototype.getPath = function () {
	return this._path;
};

Log.prototype.start = function (name, cb) {

	if (!this._path) {
		// no logging
		return cb();
	}

	var logPath = this._path;

	if (this._path.substring(this._path.length - 1, 1) !== '/') {
		logPath += '/' + modName.get() + '.';
	}

	log.config({
		file: logPath,
		level: '>= info',
		bufferSize: 0
	});

	logger = log.create(name);

	if (cb) {
		cb();
	}
};

Log.prototype.stop = function (error, cb) {
	if (!logger) {
		if (cb) {
			cb();
		}
		return;
	}

	if (error) {
		logger.error(error);
	}
	log.clean(function () {
		if (cb) {
			cb();
		}
	});
};

Log.prototype.info = function (msg) {

	if (!logger) {
		return;
	}

	logger.info(msg);
};

Log.prototype.error = function (msg) {

	if (!logger) {
		return;
	}

	logger.error(msg);
};
