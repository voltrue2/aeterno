'use strict';

var print = require('../lib/print');
var Status = require('../lib/status').Status;

module.exports = function (path) {
	// listener for exceptions
	process.on('uncaughtException', function (error) {
		print.error(print.r(error.message));
		print.error(print.r(error.stack));
		process.exit(1);
	});
	// stop daemon
	var status = new Status(path);
	status.setup(function () {
		if (!status.isRunning) {
			return status.end(new Error('Daemon process ' + path + ' not running'));
		}
		status.stop();
	});
};
