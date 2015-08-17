'use strict';

var fs = require('fs');
var libargs = require('../lib/args');
var modName = require('../lib/modname');
var print = require('../lib/print');
var run = require('child_process').spawn;
var Status = require('../lib/status').Status;
var root = __dirname;

module.exports = function (path, logPath, autoReload, execPath) {
	// listener for exceptions
	process.on('uncaughtException', function (error) {
		print.error(print.r('Failed to start daemon: ' + path));
		print.error(print.r(error.message));
		print.error(print.r(error.stack));
		process.exit(1);
	});
	var cwd = getCwd(path);
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
			execPath,
			libargs.passOptionsToApp(path)
		];

		if (logPath) {
			logPath = logPath[0] === '/' ? logPath : cwd + logPath;
			args.push('-l');
			args.push(logPath);
			print.out('Logging in', logPath);
		} else {
			print.out(print.r('<WARNING> Starting daemon with logging option is recommanded.'));
		}
		
		if (autoReload.length) {
			args.push('-w');
			for (var i = 0, len = autoReload.length; i < len; i++) {
				var wPath = autoReload[i][0] === '/' ? autoReload[i] : cwd + autoReload[i];
				print.out('Watching for auto-reload:', wPath);
				fs.statSync(wPath);
				args.push(wPath);
			}
			print.out('Auto-restart enabled');
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
					print.p(path),
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


function getCwd(appPath) {
	var finder = function (dir) {

		if (dir === '.' || dir === 'index.js' || dir === './index.js') {
			return './';
		}

		if (dir === '/') {
			return dir;
		}

		var stat = fs.statSync(dir);
		if (stat.isDirectory()) {

			if (dir[0] !== '/' && dir[0] !== '.') {
				dir = './' + dir;
			}

			if (dir[dir.length - 1] !== '/') {
				dir += '/';
			}

			return dir;
		}
		return finder(dir.substring(0, dir.lastIndexOf('/')));
	};
	return finder(appPath);
}

