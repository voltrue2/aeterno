'use strict';

var print = require('../lib/print');
var Status = require('../lib/status').Status;

module.exports = function () {
	// listener for exceptions
	process.on('uncaughtException', process.exit);
	// try to clean up
	var status = new Status();
	status.clean(function (error, cleaned) {
		if (error) {
			return status.end(error);
		}
		if (cleaned) {
			print.out(
				'All detached daemon socket files have been removed'
			);
		} else {
			print.out(
				'No detached daemon socket files to be removed'
			);
		}
		status.end();
	});
};
