'use strict';

var RCFILE_PATH = __dirname + '/../../../.aeternorc';

var fs = require('fs');
var modName = require('./modname');
var print = require('./print');
var args = require('./args');

var command = args.getCommand();

var help;

var externalRCFile = processRCFile();

if (!externalRCFile) {
	// read internal RC file
	processRCFile(__dirname + '/../.aeternorc');
}

handleHelp();

exports.appPath = null;

exports.cli = false;

exports.run = function (cb) {
	try {
		execCommand(command, require(__dirname + '/../src/' + command));
	} catch (e) {

		if (args.isVerbose()) {
			print.verbose(e);
			print.error(print.r(e.message));
			print.error(print.r(e.stack));
		}

		// this error will be ignored if cli = false
		if (exports.cli) {
			// unkown command or no command
			print.error(print.r('Invalid command given'));
			outputHelpText();
			process.exit(1);
		}

		// we call the callback only here,
		// so that in non-cli mode, if there's no command given
		// the application can move on
		if (typeof cb === 'function') {
			cb();
		}
	}
};

function processRCFile(path) {
	try {
		var fileData = fs.readFileSync(path || RCFILE_PATH, 'utf8');
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

		if (data.color) {
			print.useColor();
		}

		return true;

	} catch (e) {
		// we ignore if there is no .aeternorc file in the application root
		// we are now falling back to internal .aeternorc file
		return false;
	}
}

function handleHelp() {
	if (args.isHelpMode() && help) {
		outputHelpText();
		process.exit(0);
	}
}

function outputHelpText() {
	print.out(help.usage || '');
	print.out(help.reloadNote || '');
	print.out(help.description || '');
	print.out(help.options || '');
	print.out((help.log || '') + (help.logDesc || ''));
	print.out((help.exec || '') + (help.execDesc || ''));
	print.out((help.watch || '') + (help.watchDesc || ''));
	print.out((help.verbose || '') + (help.verboseDesc || ''));
	print.out(help.example);
	print.out((help.start || '') + (help.startDesc || ''));
	print.out((help.startWithPath || '') + (help.startWithPathDesc || ''));
	print.out((help.startWithLog || '') + (help.startWithLogDesc || ''));
	print.out((help.startAndWatch || '') + (help.startAndWatchDesc || ''));
}

function execCommand(name, cmd) {

	var path = getPath();

	switch (name) {
		case args.COMMANDS.start:
			cmd(path, args.getLogPath(), args.getWatchList(), args.getExec());
			break;
		case args.COMMANDS.stop:
		case args.COMMANDS.restart:
		case args.COMMANDS.reload:
		case args.COMMANDS.status:
			handleAddingOptions(path, function () {
				cmd(path);
			});
			break;
		case args.COMMANDS.list:
		case args.COMMANDS.clean:
			cmd();
			break;
		default:
			print.error('No valid command to run:', name);
			break;
	}
}

function handleAddingOptions(path, cb) {
	var addlog = args.getLogPath();
	
	if (!addlog) {
		// do nothing
		return cb();
	}

	var Status = require('./status').Status;
	var status = new Status(path);
	status.setup(function () {
		if (!status.isRunning) {
			return status.end(new Error('Daemon process ' + path + ' not running'));
		}
		status.addlog(cb);
	});
}

function getPath() {
	var index = '/index.js';
	var path = args.getPath();

	// if in non-cli mode and path is not given
	// use appPath
	if (!exports.cli && !path) {
		path = exports.appPath;
	}

	// if there is no path given
	// default to index.js of the root of application
	if (!path) {
		var sep = __dirname.split('/');
		return sep.splice(0, sep.length - 3).join('/');
	}

	// remove trailing slash
	if (path.substring(path.length - 1) === '/') {
		return path.substring(0, path.length - 1);
	}

	// remove index.js if the path ends with it
	if (path.lastIndexOf(index) === path.length - index.length) {
		return path.substring(0, path.length - index.length);
	}

	return path;
}
