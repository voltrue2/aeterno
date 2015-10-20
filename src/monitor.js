'use strict';

var fs = require('fs');
var watcher = require('../lib/watcher');
var modName = require('../lib/modname');
var args = require('../lib/args');
var net = require('net');
var spawn = require('child_process').spawn;
var socketName = require('../lib/socket-name');
var path;
var app;
var watcherList = [];
var appNameForLog = args.getPath();
// if the application dies 10 times in 10 seconds, monitor will exit
var lastAutoRestarted = 0;
var autoRestartInterval = 1000;
var maxNumOfDeath = 10;
var deathInterval = 10000;
var timeOfDeath = 0;
var deathCount = 0;
var pkg = require('../package.json');
var Log = require('../lib/log'); 
var logger = new Log(args.getLogPath());
// message
var Message = require('../lib/message');

// if an alternate name is given
if (args.getName()) {
	modName.set(args.getName());
}

// start file logging stream if enabled
// and start monitor process
logger.start(appNameForLog, function () {
	process.on('uncaughtException', function (error) {
		stopApp(function () {
			handleExit(error || null);
		});
	});

	process.on('exit', handleExit);
	
	logger.info('Daemon name: ' + modName.get());

	if (args.getCommand() === 'start') {
		path = appNameForLog || null;
		var monitorServer = net.createServer(function (sock) {
			sock.on('error', handleExit);
			sock.on('data', handleCommunication);
		});
		var sockFile = socketName(path);
		monitorServer.listen(sockFile);
		startApp();
	}
});

function handleExit(error) {
	if (error) {
		logger.error('Monitor process is terminating with an error: ' + error.message + '\n' + error.stack);
	}
	fs.unlink(socketName(path), function (err) {
		if (err) {
			return logger.error('Failed to remove socket file: ' + err.message + '\n' + err.stack);
		}
		logger.stop(error, function () {
			process.exit(error ? 1 : 0);
		});
	});
}

function handleCommunication(msg) {
	// handle the command
	var command = msg.toString();
	switch (command) {
		case 'stop':
			// we remove all listeners to prevent the monitor from restarting the application
			if (app) {
				app.removeAllListeners();
			}
			// we instruct the application process to exit and exit monitor process
			stopApp(handleExit);
			break;
		case 'restart':
			// we instruct the application process to exit and let monitor process to respawn it
			app.restart = true;
			stopApp();
			break;
		case 'reload':
			reloadApp();
			break;
		default:
			var parsed = parseCommand(command);
			if (parsed) {
				handleMessage(parsed);		
				return;
			}
			logger.error('unknown command: ' + command);
			break;
	}
}

function startApp() {
	// start the application process
	var cmd = [path];
	cmd = cmd.concat(args.getOptionsForApp().split(' '));
	//app = spawn(args.getExec(), cmd, { detached: true, stdio: 'ignore' });
	app = spawn(args.getExec(), cmd, { detached: true, stdio: 'pipe' });
	// capture application's stdout and stderr steam and log
	app.stdout.on('data', function (data) {
		logger.info('{Application} ' + data);
	});
	app.stderr.on('data', function (data) {
		logger.error('{Application} ' + data);
	});
	app.path = path;
	app.started = Date.now();
	app.reloaded = app.started;
	app.reloadedCount = 0;
	var autoRestartMsg = '';
	// auto-restart
	if (args.getWatchList().length) {
		setupAutoRestart(path, args.getWatchList());
		autoRestartMsg = ' with auto-restart enabled';
	}
	logger.info('Started daemon process of ' + path + autoRestartMsg);
	// if appllication dies unexpectedly, respawn it
	app.once('exit', function (code, signal) {
		deathCount += 1;
		logger.info(
			'Daemon process of ' + path + ' has exited (code:' + code + '): count of death [' +
			deathCount + '/' + maxNumOfDeath + ']'
		);
		if (signal) {
			logger.error('Application terminated by: ' + signal);
		}
		if (deathCount === 1) {
			// application died for the first time
			timeOfDeath = Date.now();
			// check to see if the application was alive for at least deathInterval or not
			if (!app.restart && timeOfDeath - app.started < deathInterval) {
				// the application has died in less than deathInterval >
				// we consider the application has some issues...
				var lasted = ((timeOfDeath - app.started) / 1000) + ' seconds';
				var msg = 'Application died [' + path + '] in ' + lasted +
					'. the application must be available for at least ' +
					(deathInterval / 1000) + ' seconds';
				// exit monitor
				return handleExit(new Error(msg));
			}
		}
		if (deathCount >= maxNumOfDeath) {
			var now = Date.now();
			if (now - timeOfDeath <= deathInterval) {
				// the application is dying way too fast and way too often
				return handleExit(
					new Error('Appliation [' + path + '] is dying too fast and too often')
				);
			}
			// application has died more than maxNumOfDeath but not too fast...
			deathCount = 0;
		}
		// respawn application process
		logger.info('Restarting daemon process of ' + path);
		startApp();
		var message = new Message(path);
		message.startSend();
		message.send({ success: true });
	});
}

function stopApp(cb) {
	if (app) {
		logger.info('Stopped daemon process of ' + app.path + (app.restart ? ' to restart' : ''));
		logger.stop(null, function () {
			// stop application
			app.kill();
			if (cb) {
				cb();
			}
		});
		return;
	}
	if (cb) {
		cb();
	}
}

function reloadApp(cb) {
	if (app) {
		// stop application
		app.reloaded = Date.now();
		app.reloadedCount += 1;
		// try to get gracenode version of the application if present
		var fileName = path.substring(path.lastIndexOf('/') + 1);
		try {
			var pkg = require(path.replace(fileName, '') + 'package.json');
			app.version = pkg && pkg.version ? pkg.version : 'Unknown';
		} catch (error) {
			logger.error(app.path + ' does not have a package.json [this error is not a fatal error]');
			app.version = 'Unknown';
		}
		app.kill('SIGHUP');
		logger.info('Reloading daemon process of ' + app.path);
		if (cb) {
			cb();
		}
		return;
	}
	if (cb) {
		cb();
	}
}

// dirListToWatch is either true or a string
function setupAutoRestart(path, dirListToWatch) {
	// stop watchers first
	if (watcherList.length) {
		for (var k = 0, ken = watcherList.length; k < ken; k++) {
			var item = watcherList[k];
			watcher.stop(item.path);
			logger.info('Auto-restart stopped for ' + path + ' on ' + item.path);
		}
		// reset watcherList
		watcherList = [];
	}
	// set up watchers from here on
	var appRoot = path.substring(0, path.lastIndexOf('/'));
	var list = [];
	if (dirListToWatch === true) {
		// no optional directories to watch given: watch the applicaiton root for auto-restart 
		list.push(appRoot);
	} else {
		list = dirListToWatch;
	}

	var reloader = function (dir, changed) {
		var now = Date.now();

		if (now - lastAutoRestarted <= autoRestartInterval) {
			logger.warn('Auto-restart in rapid succuessioni [' + dir + ']: auto-reload ignored');
			return;
		}

		reloadApp(function () {
			for (var i = 0, len = changed.length; i < len; i++) {
				logger.info(
					'Change in watched directories detected [' +
					changed[i].file + ']<' + changed[i].type + '>: auto-restart daemon process of ' + path
				);
			}
			lastAutoRestarted = now;
			app.restart = true;
			stopApp();
		});
	};

	// set up the watcher
	try {
		for (var i = 0, len = list.length; i < len; i++) {
			var event = watcher.start(list[i]);
			event.on('change', reloader);
			watcherList.push({ path: list[i] });
			logger.info('Auto-restart set up for ' + path + ' on ' + list[i]);
		}
	} catch (error) {
		logger.error('Failed to set up auto-restart watcher');
		throw error;
	}
}

function parseCommand(cmd) {
	var sep = cmd.split('\t');
	if (sep[0] === 'message' && sep[1] && sep[2]) {
		return { command: sep[1], value: sep[2], option: sep[3] || null };
	}
	return false;
}

function handleMessage(parsed) {
	var message = new Message(parsed.value);
	message.startSend();

	switch (parsed.command) {
		case 'status':
			message.send({
				monitorVersion: pkg.version,
				exec: args.getExec(),
				name: modName.get(),
				logPath: logger.getPath(),
				path: app.path,
				pid: app.pid,
				started: app.started,
				reloaded: app.reloaded,
				numOfRestarted: deathCount,
				reloadedCount: app.reloadedCount,
				watching: watcherList.map(function (item) {
					return item.path;
				}),
				daemonStartOptions: args.getOptionsForApp()
			});
			break;
		case 'addlog':
			var prevPath = logger.getPath();
			logger.stop(null, function () {
				logger = new Log(parsed.option);
				logger.start(appNameForLog, function () {				
					message.send({
						prevLogPath: prevPath,
						currentLogPath: logger.getPath()
					});
					logger.info(
						'logging added/changed from ' + 
						prevPath + ' to ' +
						logger.getPath()
					);
				});
			});
			break;
		case 'addwatch':
			var newWatchList = parsed.option.split(',');
			var prevWatchList = watcherList.map(function (item) {
				return item.path;
			});
			setupAutoRestart(app.path, newWatchList);
			message.send({
				prevWatchPaths: prevWatchList.join(' ')
			});
			logger.info(
				'watching added/changed from ' +
				prevWatchList.join(' ') + ' to ' +
				newWatchList.join(' ')
			);
			break;
		default:
			message.send({
				error: {
					type: 'unkownCommand',
					message: parsed.command + ' command given'
				}
			});
			logger.error('unknown command given: ' + parsed.command);	
			break;
	}
}
