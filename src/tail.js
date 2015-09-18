'use strict';

var print = require('../lib/print');
var Status = require('../lib/status').Status;
var tail = require('../lib/tail');

module.exports = function (appPath) {
	// listener for exceptions
	process.on('uncaughtException', function (error) {
		print.error(print.r(error.message));
		print.error(print.r(error.stack));
		process.exit(1);
	});
	var status = new Status(appPath);
	status.setup(function () {
		if (!status.isRunning) {
			print.error(print.r('Daemon process ' + appPath + ' is not running'));
			return status.end();
		}
		status.getStatus(function (data) {
			tail(data.msg.logPath, function (error) {
				if (error) {
					print.error(print.r('Cannot tail daemon logs:' + error.message));
				}
				status.end();
			});
		});
	});
};
