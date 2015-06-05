var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var print = require('../lib/print');
var sockName = require('../lib/socket-name');
var Status = require('../lib/status').Status;

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
						path: list[i].substring(
							list[i].lastIndexOf(monPath) + monPathLen
						).split(' ')[0]
					});
				}
			}
			next();
		});		
	};
	// find owner uid
	var findUidForApps = function (next) {
		async.each(apps, function (app, moveOn) {
			var path = sockName(app.path);
			fs.stat(path, function (error, stats) {
				if (error) {
					// we found an app running with aeterno but
					//with different daemon name -> ignore
					app.uid = 'unknown';
					print.out(
						print.r('<warn>') + 
						' An application that runs with aeterno ' +
						'found, but the daemon name is different: ' +
						app.path
					);
					return moveOn();
				}
				app.uid = stats.uid;
				moveOn();
			});
		}, next);
	};
	// find owner user
	var findUserForApps = function (next) {
		async.eachSeries(apps, function (app, moveOn) {
			exec(
				'awk -v val=' + app.uid + ' -F ":" \'$3==val{print $1}\' /etc/passwd',
				function (stderr, stdout) {
					app.user = stdout.replace(/\n/g, '');
					moveOn();
				}
			);
		}, next);
	};
	// find applications and their pids
	var findApps = function (next) {
		async.eachSeries(apps, function (appData, moveOn) {
			var status = new Status(appData.path);
			status.findProcessList(function (error, processList) {
				if (error) {
					return moveOn(error);
				}
				status.getPids(processList, function (error, list) {
					if (error) {
						return moveOn(error);
					}
					var commandLabel = ' Command		:';
					var command = '{status|start|stop|restart|reload}';
					var appPath = print.b(appData.path);
					var user = print.g(
						appData.user + ' (uid:' + appData.uid + ')'
					);
					print.out(
						' Application path	:',
						appPath
					);
					print.out(commandLabel, command);
					print.out(' Executed user		:', user);
					for (var i = 0, len = list.length; i < len; i++) {
						var app = list[i].process.replace(process.execPath + ' ', '');
						var pid = '(' + list[i].pid + ')';
						var label = ' Application process	: ';
						if (app.indexOf('monitor start') !== -1) {
							label = ' Monitor process	: ';
						}
						print.out(label + app, pid);
					}
					moveOn();
				});
			});
		}, next);
	};
	var done = function (error) {
		if (error) {
			print.error(print.r(error.message));
			print.error(print.r(error.stack));
			return process.exit(1);
		}
		process.exit();
	};
	// execute the commands
	async.series([
		getAppPaths,
		findUidForApps,
		findUserForApps,
		findApps
	], done);
};
