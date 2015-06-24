var exec = require('child_process').exec;
var async = require('async');
var args = require('../lib/args');
var print = require('../lib/print');
var modName = require('../lib/modname');
var Status = require('../lib/status').Status;
var res = {
	stopped: [],
	skipped: []
};

module.exports = function () {
	// exception
	process.on('uncaughtException', function (error) {
		print.error(print.r(error.message));
		print.error(print.r(error.stack));
		process.exit(1);
	});
	var apps = [];
	// get list of applications
	var getAppPaths = function (next) {
		var monPath = 'aeterno/src/monitor start ';
		var monPathLen = monPath.length;
		exec('ps aux | grep "' + monPath + '"', function (error, stdout) {
			if (error) {
				return next(error);
			}
			var list = stdout.split('\n');
			for (var i = 0, len = list.length; i < len; i++) {
				if (list[i].indexOf(process.execPath) !== -1) {
					apps.push({
						name: modName.getNameFromPath(list[i]),
						path: list[i].substring(
							list[i].lastIndexOf(monPath) + monPathLen
						).split(' ')[0]
					});
				}
			}
			next();
		});		
	};
	var stop = function (next) {
		process.stdin.setEncoding('utf8');
		process.stdin.resume();
		print.out('Stopping all daemon processes:');
		async.eachSeries(apps, function (item, moveOn) {
			stopDaemon(item, moveOn);
		}, next);
	};
	var done = function (error) {
		if (error) {
			print.error(print.r(error.message));
			print.error(print.r(error.stack));
			return process.exit(1);
		}

		print.out('\n');

		for (var i = 0, len = res.stopped.length; i < len; i++) {
			print.out(print.g('Stopped: ') + print.p(res.stopped[i]));
		}
		for (var j = 0, jen = res.skipped.length; j < jen; j++) {
			print.out(print.r('Skipped: ') + print.p(res.skipped[j]));
		}

		print.out('\nStop all [ ' + print.g('DONE') + ' ]\n');
		process.exit();
	};
	var tasks = [
		getAppPaths,
		stop
	];
	// execute the commands
	async.series(tasks, done);
};

function stopDaemon(item, cb) {

	print.out('\nDaemon process: ' + print.p(item.path));

	var status = new Status(item.path);
	status.setup(function () {

		if (!status.isRunning) {
			print.error(print.r(item.path + ' is not running'));
			return cb();
		}

		status.getStatus(function (data, list) {
			
			if (args.isForced()) {
				// stop daemon without user input
				print.out(
					'Stopping with option -f ' +
					print.p(item.path)
				);
				res.stopped.push(item.path);
				status.stop(cb);
				return;
			}
			// stop daemon with user input	
			status.outputStatus(data, list);
			process.stdout.write(
				'Are you sure you want to stop ' +
				'[ ' + print.p(item.path) + ' ]? ' +
				'Type [y/n]: '
			);
			process.stdin.once('data', function (data) {
				if (data === 'y\n') {
					print.out(
						'Stopping ' +
						print.p(item.path)
					);
					res.stopped.push(item.path);
					return status.stop(cb);
				}
				res.skipped.push(item.path);
				print.out('Skipping ' + print.p(item.path));
				cb();
			});
		});
	});
}
