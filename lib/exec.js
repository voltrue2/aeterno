'use strict';

var print = require('./print');
var args = require('./args');

var command = args.getCommand();

handleHelp();

exports.cli = false;

exports.run = function (cb) {
	try {
		execCommand(command, require('../' + command));
	} catch (e) {
		// this error will be ignored if cli = false
		if (exports.cli) {
			// unkown command or no command
			print.error(print.r('Invalid command given: {' + command + '}'));
			process.exit(1);
		}

		if (args.isVerbose()) {
			print.verbose(e);
			print.error(print.r(e.message));
			print.error(print.r(e.stack));
		}

		// we call the callback only here,
		// so that in non-cli mode, if there's no command given
		// the application can move on
		if (typeof cb === 'function') {
			cb();
		}
	}
};

function handleHelp() {
	if (args.isHelpMode()) {
		print.out(
			'Usage:',
			'./aeterno {start|stop|restart|reload|status|list|clean}',
			'[PATH]...',
			'[OPTION]'
		);
		print.out('{reload} works ONLY if your application handles SIGHUP.');
		print.out('');
		print.out('Daemonaize a target application process and monitor it.');
		print.out('');
		print.out('Options:');
		print.out(
			'	-l',
			'	write log data into a file'
		);
		print.out(
			'	-w',
			'	automatically restart the daemon process if watch file(s) change'
		);
		print.out('');
		print.out('Examples:');
		print.out(
			'	./aeterno start',
			'			Start a daemon process.'
		);
		print.out(
			'	./aeterno start ./myServer.js',
			'		Start a daemon process of "./myServer.js".'
		);
		print.out(
			'	./aeterno start -l ./daemonlog/',
			'	Start a daemon process and write log data to "./daemonlog/" directory.'
		);
		print.out('	./aeterno start -w ./modules ./lib',
			'	Start a daemon process and watch "./modules"' +
			' and "./lib". Anything changes in the watched directory,' +
			' daemon process will automatically restart'
		);
		process.exit(0);
	}
}

function execCommand(name, cmd) {
	// if in non-cli mode and path is not given
	// use appPath
	var path = args.getPath();

	if (!exports.cli && !path) {
		path = exports.appPath;
	}

	switch (name) {
		case args.COMMANDS.start:
			cmd(path, args.getLogPath(), args.getWatchList());
			break;
		case args.COMMANDS.stop:
		case args.COMMANDS.restart:
		case args.COMMANDS.reload:
		case args.COMMANDS.status:
			cmd(path);
			break;
		case args.COMMANDS.list:
		case args.COMMANDS.clean:
			cmd();
			break;
		default:
			print.error('No valid command to run:', cmd);
			break;
	}
}
