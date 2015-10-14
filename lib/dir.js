'use strict';

var fs = require('fs');

module.exports = readDir;

function readDir(path, parentPath) {

	if (!parentPath) {
		parentPath = '';
	} else {
		if (parentPath[parentPath.length - 1] !== '/' && path[0] !== '/') {
			parentPath += '/';
		}
	}

	var filePath = parentPath + path;

	var res = [];
	try {
		var stat = fs.lstatSync(filePath);
		if (!stat.isDirectory()) {
			res.push(filePath);
		} else {
			var list = fs.readdirSync(filePath);
			var len = list.length;
			if (!len) {
				res.push(filePath);
			}
			parentPath = filePath;
			for (var i = 0; i < len; i++) {
				res = res.concat(readDir(list[i], parentPath));
			}
		}
		return res;
	} catch (e) {
		return e;
	}
}
