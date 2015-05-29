'use strict';

var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var net = require('net');
var Message = require('./message');
var socketName = require('./socket-name');
var args = require('./args');
var print = require('./print');
var MAX_TRY = 10;

function createRegExpPattern(path) {
	var pattern = '(' + path + ' |' + path + '/ |' +
		(path.substring(0, path.length - 1)) +
		' |' + path + 'index.js |' + path + '/index.js )';
	return pattern;
}

function Status(appPath) {
	this.isRunning = true;
	this.appPath = appPath;
	this.socketName = '';
	this.sockFile = '';
	this.verboseEnabled = args.isVerbose();
	this.verbose('Status validation for ' + this.appPath);
	this.verbose('Status validation is in verbose mode');
}

Status.prototype.verbose = function (msg) {
	if (!this.verboseEnabled) {
		return;
	}
	print.verbose('[Application Status]', msg);
};

Status.prototype.end = function (error) {
	this.verbose('End of status validation');
	if (error) {
		print.error(print.r(error.message));
		return process.exit(1);
	}
	process.exit();
};

Status.prototype.setSocketName = function (procPath) {

	if (!procPath) {
		procPath = this.appPath;
	}

	if (procPath.indexOf(this.appPath + '/index.js') !== -1) {
		this.socketName = this.appPath + '/index.js';
	} else if (procPath.indexOf(this.appPath + 'index.js') !== -1) {
		this.socketName = this.appPath + 'index.js';
	} else if (procPath.indexOf(this.appPath + '/') !== -1) {
		this.socketName = this.appPath + '/';
	} else if (procPath.indexOf(this.appPath) !== -1) {
		this.socketName = this.appPath;
	} else if (procPath.indexOf(this.appPath.replace('/index.js', '/')) !== -1) {
		this.socketName = this.appPath.replace('/index.js', '/');
	} else if (procPath.indexOf(this.appPath.replace('/index.js', '/')) !== -1) {
		this.socketName = this.appPath.replace('/index.js', '');
	}
};

Status.prototype.setup = function (cb) {
	var that = this;
	var processList = [];
	var findAppProcessList = function (next) {
		that.verbose('Find application processes');
		that.findProcessList(function (error, list) {
			if (error) {
				throw error;
			}
			processList = list;
			if (!processList || !processList.length) {
				// there is no process running
				that.isRunning = false;
				that.verbose('No application process running');
			}
			// find the real path used to run the application process
			that.setSocketName(processList ? processList[0] : null);
			that.verbose('Socket name is ' + that.socketName);
			next();
		});
	};
	var findSockFile = function (next) {
		if (!that.socketName) {
			that.isRunning = false;
			that.verbose('Socket file validation skipped beause there is no process running');
			return next();
		}
		that.sockFile = socketName(that.socketName);
		that.verbose('Socket file path is ' + that.sockFile);
		fs.exists(that.sockFile, function (exists) {
			if (exists) {
				if (!that.isRunning) {
					print.error(
						print.r(
							'Application process(es) associated to',
							'the socket file not found [' + that.appPath + ']'
						)
					);
					print.error(
						print.r(
							'Use "clean" command to clean up',
							'the detached socket files to continue'
						)
					);
					print.out('Cleaning the detached socket files before continuing...');
					return that.clean(next);
				}
				// application is running
				that.isRunning = true;
				that.verbose('Application is running');
				return next();
			}
			if (that.isRunning) {
				// there are processes w/o associated socket file
				print.error(
					print.r(
						'Associated socket file [' + that.sockFile + '] not found'
					)
				);
				print.error(
					print.r(
						'Application process(es) without associated socket file',
						'found [' + that.socketName + ']:',
						'please "kill" these process(es) to continue'
					)
				);
				// get pids
				var pids = [];
				return that.getPids(processList, function (error, list) {
					if (error) {
						print.error(print.r('Failed to retrieve pid list'));
						return that.end(error);
					}
					for (var i = 0, len = list.length; i < len; i++) {
						print.error(print.r(list[i].process + ' (pid: ' + list[i].pid + ')'));
						pids.push(list[i].pid);
					}
					var problem = 'You may need to force exit the process(es): ' +
						'kill -9 ' + pids.join(' ');
					that.end(new Error(problem));
				});
			}
			// application is not running
			that.isRunning = false;
			that.verbose('Application is not running');
			next();
		});
	};
	var done = function (error) {
		if (error) {
			return that.end();	
		}
		cb();
	};
	var tasks = [
		findAppProcessList,
		findSockFile		
	];
	async.series(tasks, done);
};

Status.prototype.getStatus = function (cb) {
	var that = this;
	var message = new Message(this.appPath);
	var onData = function (data) {
		if (!data) {
			// no data...
			that.verbose('No application status data for ' + that.sockFile);
			return cb();
		}
		message.stop();
		that.findProcessList(function (error, list) {
			if (error) {
				return that.end(error);
			}
			that.getPids(list, function (error, processes) {
				if (error) {
					return that.end(error);
				}
				that.verbose('Application status data received');
				cb(data, processes);
			});
		});
	};
	// send command to monitor
	this.verbose('Get application status of ' + this.appPath + ' from ' + this.sockFile);
	message.read(onData, function () {
		var sock = new net.Socket();
		try {
			sock.connect(that.sockFile, function () {
				that.verbose('Status command sent to monitor');
				sock.write('message\tstatus\t' + that.appPath);
			});
		} catch (error) {
			cb(error);
		}
	});
};

Status.prototype.outputStatus = function (data, processes) {
	if (!data || !processes || !processes.length) {
		this.verbose('No application status data');
		return;
	}
	for (var i = 0, len = processes.length; i < len; i++) {
		var p = processes[i].process;
		p += '(pid: ' + processes[i].pid + ')';
		var prefix;
		var isMaster = data.msg.pid === processes[i].pid;
		if (p.indexOf('monitor') === -1) {
			if (isMaster) {
				prefix = ' Daemon application process (master):';
			} else {
				prefix = ' Daemon application process (worker):';
			}
		} else {
			prefix = ' Daemon monitor process             :';
		}
		var app = p.substring(p.indexOf(process.execPath));
		print.out(prefix, app);
	}
	print.out(' aeterno version			: ' + data.msg.monitorVersion);
	print.out(' Application started at			: ' +  new Date(data.msg.started));
	print.out(' Application reloaded at		: ' + new Date(data.msg.reloaded));
	print.out(' Application restarted			: ' + data.msg.numOfRestarted + ' times');
	print.out(' Application reloaded			: ' + data.msg.reloadedCount + ' times');
};

Status.prototype.stop = function () {
	// send command to monitor
	var that = this;
	var sock = new net.Socket();
	this.verbose('Stopping application processes');
	sock.connect(this.sockFile, function () {
		sock.write('stop');
		that.verbose('Instruction to stop daemon process has been sent');
		that.verbose('Is application running?');
		that.notRunning(function (error, notRunning) {
			if (error) {
				return that.end(error);
			}
			if (!notRunning) {
				return that.end(new Error('Daemon process failed to stop ' + that.appPath));
			}
			print.out(
				'Daemon process stopped:',
				print.b(that.appPath),
				'[ ' + print.g('OK') + ' ]'
			);
			that.end();
		});
	});	
};

Status.prototype.restart = function () {
	var that = this;
	var monitorResponded = false;
	var sock;
	var checkStatus = function () {
		setTimeout(function () {
			that.running(function (error, running) {
				if (error) {
					print.error(print.r(error.message));
					print.error(print.r(error.stack));
				}
				print.out('Application is running [ ' + print.g(running) + ' ]');
				if (!monitorResponded) {
					checkStatus();
				}
			});
		}, 100);
	};
	var connect = function (done) {
		sock = new net.Socket();
		sock.connect(that.sockFile, done);
	};
	var getCurrentStatus = function (done) {
		print.out('Currently running daemon status');
		that.getStatus(function (data, processes) {
			that.outputStatus(data, processes);
			done();
		});	
	};
	var restart = function (done) {
		var message = new Message(that.appPath);
		message.read(function (data) {
			message.stop();
			if (data.msg && data.msg.error) {
				return done(new Error(data.msg.error));
			}
			monitorResponded = true;
			that.verbose('Restart command response received');
			that.running(function (error, running) {
				if (error) {
					return done(error);
				}
				if (running) {
					return done();
				}
				done(new Error('Failed to restart daemon process [' + that.appPath + ']:'));
			});
		}, null);
		that.verbose('Sending restart command');
		sock.once('error', done);
		sock.write('restart');
		print.out('Restarting daemon', that.appPath);
		checkStatus();
	};
	var getNewStatus = function (done) {
		print.out('Restarted daemon status');
		setTimeout(function () {
			that.getStatus(function (data, processes) {
				that.outputStatus(data, processes);
				done();
			});
		}, 300);
	};
	async.series([
		connect,
		getCurrentStatus,
		restart,
		getNewStatus
	],
	function (error) {
		if (error) {
			return that.end(error);
		}
		print.out('Daemon process restart:',
			print.b(that.appPath),
			'[ ' + print.g('OK') + ' ]'
		);
		that.end();
	});
};

Status.prototype.reload = function () {
	var that = this;
	var seenPids = {};
	var sock;
	var connect = function (done) {
		sock = new net.Socket();
		try {
			sock.connect(that.sockFile, done);
		} catch (error) {
			done(error);
		}
	};
	var getCurrentStatus = function (done) {
		print.out('Currently running daemon status');
		that.getStatus(function (data, processes) {
			for (var i = 0, len = processes.length; i < len; i++) {
				seenPids[processes[i].pid] = true;
			}
			that.outputStatus(data, processes);
			done();
		});	
	};
	var reload = function (done) {
		try {
			sock.write('reload');
		} catch (error) {
			return done(error);
		}
		print.out('Reloading daemon ' + that.appPath);
		done();
	};
	var checkReloadStatus = function (done) {
		var newProcessList = [];
		var counter = 0;
		function check() {
			print.out('Checking process status... [ ' + print.b(counter) + ' ]');
			that.getStatus(function (data, processes) {

				if (!processes) {
					// no processes can be reloaded...
					return done(new Error('No process reloaded'));
				}

				var oldProcessNum = 0;
				for (var i = 0, len = processes.length; i < len; i++) {
					if (seenPids[processes[i].pid]) {
						oldProcessNum += 1;
					} else if (newProcessList.indexOf(processes[i].pid) === -1) {
						newProcessList.push(processes[i].pid);
						var p = processes[i].process + '(pid: ' + processes[i].pid + ')';
						print.out('Reloaded process: ' + p);
					}
				}
				// one process is a master and it does NOT reload
				// and another process is a monitor that does NOT reload
				if (oldProcessNum > 2) {
					// we still have old process(es)
					counter += 1;
					return setTimeout(check, 500 * counter);
				}
				// all processes have been reloaded
				done();
			});
		}
		setTimeout(check, 300);
	};
	var getNewStatus = function (done) {
		print.out('Reloading daemon status');
		that.running(function () {
			that.getStatus(function (data, processes) {
				that.outputStatus(data, processes);
				done();
			});
		}, 0, 0, seenPids);
	};
	async.series([
		connect,
		getCurrentStatus,
		reload,
		checkReloadStatus,
		getNewStatus
	],
	function (error) {
		if (error) {
			return that.end(error);
		}
		print.out('Reloaded application as a daemon ' + that.appPath);
		that.end();
	});
};

Status.prototype.findProcessList = function (cb) {
	// remove /index.js if there is
	var that = this;
	var path = this.appPath.replace('/index.js', '');
	var regex = new RegExp('/', 'g');
	var patterns = '(' + path + '|' + (path.substring(0, path.length - 1)) +
		'|' + (path + 'index.js').replace(regex, '\\/') +
		'|' + (path + '/index.js').replace(regex, '\\/') + ')';
	var command = 'ps aux | grep -E "' + patterns + '"';
	exec(command, function (error, stdout) {
		if (error) {
			return cb(error);
		}
		var processList = [];
		var list = stdout.split('\n');
		var monitorPath = 'monitor start ' + path;
		var appPath = process.execPath + ' ' + path;
		var monitorReg = new RegExp(createRegExpPattern(monitorPath));
		var appReg = new RegExp(createRegExpPattern(appPath));
		for (var i = 0, len = list.length; i < len; i++) {
			var p = list[i] + ' ';
			// find monitor process
			if (p.match(monitorReg)) {
				processList.push(list[i]);
				that.verbose('Daemon monitor process found: ' + list[i]);
				continue;
			}
			// find app process
			if (p.match(appReg)) {
				processList.push(list[i]);
				that.verbose('Daemon application process found: ' + list[i]);
			}
		}
		cb(null, processList);
	});
};

Status.prototype.getPids = function (processList, cb) {
	exec('ps aux | pgrep node', function (error, stdout) {
		if (error) {
			return cb(error);
		}
		var res = [];
		var list = stdout.split('\n');
		while (list.length) {
			var pid = list.shift();
			if (!pid) {
				continue;
			}
			for (var i = 0, len = processList.length; i < len; i++) {
				if (processList[i].indexOf(pid) !== -1) {
					res.push({
						process: processList[i].substring(processList[i].indexOf(process.execPath)),
						pid: parseInt(pid, 10)
					});
				}
			}
		}
		cb(null, res);
	});
};

Status.prototype.running = function (cb, counter, running, seen) {
	counter = counter || 0;
	running = running || 0;
	seen = seen || {};
	var that = this;
	this.verbose(
		'Is application running? (counter:' + counter + ') ' +
		'[running processes: ' + running + ']'
	);
	// recursive call function
	var call = function () {
		setTimeout(function () {
			that.running(cb, counter, running, seen);
		}, 100 + (counter * 20));
	};
	// application needs to be found running more than half of the time
	if (running >= MAX_TRY / 2) {
		return cb(null, true);
	}
	if (counter > MAX_TRY) {
		that.verbose('Application is not running [no more try]');
		return cb(null, false);
	}
	counter += 1;
	this.findProcessList(function (error, processList) {
		if (error) {
			return cb(error);
		}
		// we found some process(es) running
		if (processList && processList.length) {
			that.getPids(processList, function (error, list) {
				var len = list.length;
				for (var i = 0; i < len; i++) {
					// we need at least 2 processes running: one is monitor and another is the application
					if (len > 1 && list[i].process.indexOf('monitor start ') !== -1) {
						running += 1;
					}
					// feedback output of running process(es)
					if (!seen[list[i].pid]) {
						seen[list[i].pid] = true;
						print.out(
							'Checking running process: ' + list[i].process,
							'(pid: ' + list[i].pid + ')'
						);
					}
				}
				call();
			});
			return;
		}
		that.verbose('Application is not running');
		// we don't see any process running
		running -= 1;
		call();
	});
};

Status.prototype.notRunning = function (cb, counter) {
	counter = counter || 0;
	var that = this;
	// stopping application gracefully may take some time, so we try more than start
	var max = MAX_TRY * 4;
	var next = function () {
		setTimeout(function () {
			counter += 1;
			that.notRunning(cb, counter);
		}, 100 + (20 * counter));
	};
	this.findProcessList(function (error, list) {
		if (error) {
			return cb(error);
		}
		that.verbose('Checking the number of running process remaining: ' + list.length);
		if (list.length) {
			print.out('Running process count: ' + list.length + ' (counter:' + counter + ')');
			if (counter === max) {
				var problem = '[timeout] failed to stop daemon application processes gracefully';
				return cb(new Error(problem));
			}
			return next();
		}
		that.verbose('No more process running');
		cb(null, true);
	});
};

// cleans up all orphan socket files without monitor process
Status.prototype.clean = function (cb) {
	var socks = [];
	var toBeRemoved = [];
	var getAllSocks = function (next) {
		fs.readdir('/tmp/', function (error, list) {
			if (error) {
				return next(error);
			}
			// pick gracenode daemon socket files only
			socks = list.filter(function (item) {
				return item.indexOf('aeterno') === 0;
			});
			next();
		});
	};
	var findMonitors = function (next) {
		async.eachSeries(socks, function (sockFile, callback) {
			var path = '/tmp/' + sockFile;
			var sock = new net.Socket();
			sock.once('error', function () {
				// this socket file's monitor process is no longer there
				toBeRemoved.push(path);
				callback();
			});
			sock.connect(path, function () {
				// this socket file's monitor is still running
				callback();
			});
		}, next);
	};
	var removeOrphanSocketFiles = function (next) {
		async.eachSeries(toBeRemoved, function (path, callback) {
			fs.unlink(path, function (error) {
				if (error) {
					// failed to remove. move on
					print.error('Failed to remove socket file without application process: ' + path);
					return callback();
				}
				print.out('Socket file without application proccess has been deleted: ' + path);
				callback();
			});
		}, next);
	};
	async.series([getAllSocks, findMonitors, removeOrphanSocketFiles], function (error) {
		if (error) {
			return cb(error);
		}
		cb(null, toBeRemoved.length > 0);
	});
};

module.exports.Status = Status;
