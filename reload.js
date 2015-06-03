'use strict';

var print = require('./lib/print');
var Status = require('./lib/status').Status;

module.exports = function (path) {
	// listener for exceptions
	process.on('uncaughtException', function () {
		print.error(print.r(path));
		process.exit(1);
	});
	// check for daemon process
	var status = new Status(path);
	status.setup(function () {
		if (!status.isRunning) {
			print.error(print.r('Daemon process ' + path + ' not running'));
			return status.end(new Error('Daemon process ' + path + ' not running'));	
		}
		status.reload();
	});
};
