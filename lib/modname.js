'use strict';

var name = 'aeterno';

exports.set = function (n) {
	name = n;
};

exports.get = function () {
	return name;
};

exports.getNameFromPath = function (path) {
	var index = path.lastIndexOf('-n');
	
	if (index === -1) {
		return null;
	}

	// +2 for the length of "-n" and +1 for a space
	var sep = path.substring(index + 3).split(' ');
	// the first element in the array should be the mod name
	return sep[0];
};

exports.setNameFromPath = function (path) {
	var nameFromPath = exports.getNameFromPath(path);
	if (nameFromPath) {
		exports.set(nameFromPath);
	}
};
