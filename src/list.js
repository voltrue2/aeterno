var fs = require('fs');
var exec = require('child_process').exec;
var async = require('../lib/async');
var print = require('../lib/print');
var sockName = require('../lib/socket-name');
var modName = require('../lib/modname');
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
	// find owner uid
	var findUidForApps = function (next) {
		async.each(apps, function (app, moveOn) {
			var path = sockName(app.path, app.name);
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
		async.eachSeries(apps, findApp, next);
	};
	var findApp = function (appData, cb) {
		var st = new Status(appData.path);
		st.setup(function () {
			if (!st.isRunning) {
				return cb();
			}
			st.getStatus(function (data, list) {
				if (!data) {
					// cannot find the app
					return cb();
				}
				data.user = appData.user;
				data.uid = appData.uid;
				st.outputStatus(data, list, true);
				cb();
			});
		});
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
