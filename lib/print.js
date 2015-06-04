// cannot use strict mode because we use Octal literals for colors

var COLORS = {
	RED: '0;31',
	GREEN: '0;32',
	BLUE: '1;34',
	BROWN: '0;33'
};

exports.out = function () {
	var str = '';
	for (var i = 0, len = arguments.length; i < len; i++) {
		str += prep(arguments[i]);
	}
	console.log(str);
};

exports.error = function () {
	var str = '';
	for (var i = 0, len = arguments.length; i < len; i++) {
		if (arguments[i] instanceof Error) {
			str += arguments[i].message + '\n';
			str += arguments[i].stack + '\n';
			continue;
		}
		str += prep(arguments[i]);
	}
	console.error(str);
};

exports.verbose = function () {
	var str = '';
	for (var i = 0, len = arguments.length; i < len; i++) {
		str += prep(arguments[i]);
	}
	console.log(color('[verbose]' + str, COLORS.BROWN));
};

exports.r = function (msg) {
	return color(msg, COLORS.RED);
};

exports.g = function (msg) {
	return color(msg, COLORS.GREEN);
};

exports.b = function (msg) {
	return color(msg, COLORS.BLUE);
};

exports.y = function (msg) {
	return color(msg, COLORS.BROWN);
};

function prep(msg) {
	if (typeof msg === 'object') {
		return '\n' + JSON.stringify(msg, 2, null) + '\n';
	}
	return msg + ' ';
}

function color(str, colorCode) {
	return '\033[' + colorCode + 'm' + str + '\033[0m';
}
