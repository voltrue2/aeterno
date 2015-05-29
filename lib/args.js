'use strict';

// required commands
var COMMANDS = {
	start: 'start',
	stop: 'stop',
	restart: 'restart',
	reload: 'reload',
	status: 'status',
	list: 'list',
	clean: 'clean'
};
// options
var OPTIONS = {
	'-l': true,
	'-w': true,
	'-v': true,
	'--verbose': true,
	'--help': true,
	'-h': true
};

// daemon command: [start|stop|restart|reload|status|list|clean]
var command;
// path of the application
var path;
// options
var options = {};

parse();

function parse() {
	parseOptions(process.argv);
	setCommandAndPath();
}

function parseOptions(list) {
	var optionName;

	for (var i = 0, len = list.length; i < len; i++) {
		if (OPTIONS[list[i]] || COMMANDS[list[i]]) {
			// option name
			optionName = list[i];
			options[optionName] = [];
			continue;
		}
		if (options[optionName]) {
			// option value
			options[optionName].push(list[i]);
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

exports.getCommand = function () {
	return command;
};

exports.getPath = function () {
	return path;
};

exports.isHelpMode = function () {
	if (options['--help'] || options['-h']) {
		return true;
	}
	return false;
};

exports.COMMANDS = COMMANDS;

exports.getLogPath = function () {
	if (options['-l']) {
		// only 1 path for logging
		return options['-l'][0];		
	}
	return null;
};

exports.getWatchList = function () {
	if (options['-w']) {
		return options['-w'];
	}
	return [];
};

exports.isVerbose = function () {
	if (options['-v'] || options['--verbose']) {
		return true;
	}
	return false;
};
