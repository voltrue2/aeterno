'use strict';

var modName = require('../lib/modname');
var print = require('../lib/print');
var run = require('child_process').spawn;
var Status = require('../lib/status').Status;
var root = __dirname;

module.exports = function (path, logPath, autoReload, execPath) {
	// listener for exceptions
	process.on('uncaughtException', function (error) {
		print.error(print.r(error.message));
		print.error(print.r(error.stack));
		process.exit(1);
	});
	var status = new Status(path);
	status.setup(function () {
		if (status.isRunning) {
			return status.end(new Error('Daemon process' + path + ' is already running'));
		}
		// set up the options
		var args = [
			root + '/monitor',
			'start',
			path,
			'-n',
			modName.get(),
			'-e',
			execPath
		];
		if (logPath) {
			args.push('-l');
			args.push(logPath);
			print.out('Logging in', logPath);
		}
		if (autoReload.length) {
			args.push('-w');
			for (var i = 0, len = autoReload.length; i < len; i++) {
				args.push(autoReload[i]);
				print.out('Watching:', autoReload[i]);
			}
			print.out('Auto-restart enabled:');
		}
		// start daemon
		run(process.execPath, args, { detached: true, stdio: 'ignore' });
		// now check the process' health
		status.running(function (error, running) {
			if (error) {
				return status.end(error);
			}
			if (running) {
				print.out(
					'Daemon process started:',
					print.b(path),
					'[ ' + print.g('OK') + ' ]'
				);
				print.out(
					'If the application',
					'dies 10 times in less than',
					'10 seconds, the daemon process will exit'
				);
			} else {
				error = new Error('Daemon process failed to start');
			}
			status.end(error);
		});
	});
};
