'use strict';

var RCFILE_PATH = __dirname + '/../../.aeternorc';

var fs = require('fs');
var modName = require('./modname');
var print = require('./print');
var args = require('./args');

var command = args.getCommand();

var help;

processRCFile();

handleHelp();

exports.appPath = null;

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

function processRCFile() {
	try {
		var fileData = fs.readFileSync(RCFILE_PATH, 'utf8');
		var data = JSON.parse(fileData);		
		
		if (!data) {
			// rc file is empty
			return;
		}

		if (data.name) {
			modName.set(data.name);
		}

		if (data.help) {
			help = data.help;			
		}

	} catch (e) {
		// we ignore if there is no .aeternorc file
	}
}

function handleHelp() {
	if (args.isHelpMode() && help) {
		print.out(help.usage || '');
		print.out(help.reloadNote || '');
		print.out(help.description || '');
		print.out(help.options || '');
		print.out((help.log || '') + (help.logDesc || ''));
		print.out((help.watch || '') + (help.watchDesc || ''));
		print.out((help.verbose || '') + (help.verboseDesc || ''));
		print.out(help.example);
		print.out((help.start || '') + (help.startDesc || ''));
		print.out((help.startWithPath || '') + (help.startWithPathDesc || ''));
		print.out((help.startWithLog || '') + (help.startWithLogDesc || ''));
		print.out((help.startAndWatch || '') + (help.startAndWatchDesc || ''));
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
