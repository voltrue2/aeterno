var COLS = process.stdout.columns;
var modname = require('./modname');
/*
Supported structure:
[<stirng>, <string> ...]
*/
module.exports.create = function (list, offsetSpacePerRow) {
	var len = list.length;
	var basespace = space(offsetSpacePerRow || 0);
	var longest = getLongest(list);
	for (var i = 0; i < len; i++) {
		var head = '';
		var tail = '';
		if (i > 0) {
			head = basespace;
			tail = space(longest - ((head.length + list[i].length) - 1));
		} else {
			tail = space(longest - ((basespace.length + list[i].length) - 1));
		}
		list[i] = head + list[i] + tail;
	}
	return list.join('\n');
};

module.exports.list = function (appPath, list) {
	var len = list.length;
	var res = [];
	var longest = getLongest(list);
	// create a title
	var title = '  ' + modname.get() + ' PROCESS STATUS';
	var diff = longest - title.length;
	res.push('\033[7m' + title + space(diff) + '\033[0m');
	// create the alternating table
	for (var i = 0; i < len; i++) {
		var spacer = '';
		if (longest > list[i].length) {
			spacer = space(longest - list[i].length);
		}
		// add heading space
		list[i] = ' ' + color(appPath, list[i]) + spacer;
		/*
		// alternate background color
		if (i % 2 === 0) {
			list[i] = '\033[0;30m\033[47m' + list[i] + spacer + '\033[0m';
		} else {
			list[i] = '\033[0;97m\033[104m' + list[i] + spacer + '\033[0m';
		}
		*/
		// add it to res array
		res.push(list[i]);
	}
	return res;
};

function color(appPath, str) {
	if (str.indexOf('\033') !== -1) {
		return str;
	}
	// color numbers
	str = str.replace(/[0-9]/g, function (matched) {
		return '\033[35m' + matched + '\033[0m';
	});
	return str;
}

function getLongest(/*list*/) {
	return COLS - 2;
	/*
	var l = 0;
	for (var i = 0, len = list.length; i < len; i++) {
		var item = list[i];
		var lbIndex = item.indexOf('\n');
		if (lbIndex !== -1) {
			item = item.substring(0, lbIndex);
		}
		if (l < item.length) {
			l = item.length;
		}
	}
	return l;
	*/
}

function space(n) {
	var s = '';
	for (var i = 0; i <= n; i++) {
		s += ' ';
	}
	return s;
}
