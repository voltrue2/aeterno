'use strict';

// required commands
var COMMANDS = {
	start: 'start',
	stop: 'stop',
	stopall: 'stopall',
	restart: 'restart',
	restartall: 'restartall',
	reload: 'reload',
	update: 'update',
	status: 'status',
	tail: 'tail',
	list: 'list',
	clean: 'clean'
};
// options
var OPTIONS = {
	'-f': true,
	'--log': true,
	'-l': true,
	'-w': true,
	'-e': true,
	'--exec': true,
	'-a': true,
	'-v': true,
	'--verbose': true,
	'--help': true,
	'-h': true,
	'-n': true // internal use only (used only by monitor)
};

var APP_OPTIONS = '--app-options';

// daemon command: [start|stop|restart|reload|status|tail|list|clean]
var command;
// path of the application
var path;
// options: this map contains all options
var options = {};

parse();

function parse() {
	parseOptions(process.argv);
	setCommandAndPath();
}

function parseOptions(list) {
	var optionName;
	var prevName;
	var values = [];

	for (var i = 0, len = list.length; i < len; i++) {
		var arr = [];

		// option name
		optionName = list[i];
		
		if (optionName.indexOf('--') === 0) {
			var tmp = optionName.split('=');
			optionName = tmp[0];
			if (tmp[1] !== undefined) {
				arr.push(tmp[1]);
			}
		}

		// option name MUST have a leading -
		if (optionName[0] === '-') {
			options[optionName] = arr;
		}
		
		if (OPTIONS[optionName] || COMMANDS[optionName]) {
			options[optionName] = arr;
			prevName = optionName;
			continue;
		}
		
		if (options[prevName]) {
			// option value
			options[prevName].push(list[i]);
			// add it to option value list to be ignored as option names later
			values.push(list[i]);
		}

	}

}

function setCommandAndPath() {
	for (var name in options) {
		if (COMMANDS[name]) {
			command = name;
			// the module accepts 1 path only
			path = options[name].shift();
			// remove command from options
			delete options[name];
			break;
		}
	}
}

exports.COMMANDS = COMMANDS;

exports.getCommand = function () {
	return command || null;
};

exports.getPath = function () {
	return path || null;
};

exports.isHelpMode = function () {
	if (options['--help'] || options['-h']) {
		return true;
	}
	return false;
};

exports.getLogPath = function () {
	if (options['--log']) {
		// only 1 path for logging
		return options['--log'][0];		
	}
	if (options['-l']) {
		// only 1 path for logging
		return options['-l'][0];		
	}
	return null;
};

exports.getWatchList = function () {
	if (options['-a']) {
		return options['-a'];
	}
	if (options['-w']) {
		return options['-w'];
	}
	return [];
};

exports.getExec = function () {
	if (options['-e']) {
		return options['-e'][0];
	}
	if (options['--exec']) {
		return options['--exec'][0];
	}
	// default is node
	return process.execPath;
};

exports.isVerbose = function () {
	if (options['-v'] || options['--verbose']) {
		return true;
	}
	return false;
};

exports.getName = function () {
	return options['-n'] || null;
};

exports.isForced = function () {
	if (options['-f']) {
		return true;
	}
	return false;
};

exports.getArgFromPath = function (optionName, path) {
	var index = path.lastIndexOf(optionName);

	if (index === -1) {
		return null;
	}

	// +1 for a space
	var sep = path.substring(index + (optionName.length + 1)).split(' ');
	var list = [];
	for (var i = 0, len = sep.length; i < len; i++) {
		if (sep[i].substring(0, 1) === '-') {
			break;
		}
		list.push(sep[0]);
	}
	return list;
};

// this is called from start.js to pass exactly the same options to daemon app
exports.passOptionsToApp = function (appPath) {
	var list = [];

	for (var name in options) {
		// ignore exec and app path
		if (name === process.argv[0] || name === process.argv[1]) {
			continue;
		}
		// ignore app path
		if (name === appPath) {
			continue;
		}
		// ignore aeterno options
		if (OPTIONS[name]) {
			continue;
		}
		// add to the list to be passed to app
		list.push(name);
	}

	return APP_OPTIONS + '=' + list.join(',');
};

// this is called from monitor to extract options passed from .passOptionsToApp()
exports.getOptionsForApp = function () {
	var opt = options[APP_OPTIONS] || [];
	var value = opt[0] || null;

	if (!value) {
		return '';
	}

	return value.replace(/,/g, ' ');
};
