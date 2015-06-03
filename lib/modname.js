'use strict';

var name = 'aeterno';

exports.set = function (n) {
	name = n;
};

exports.get = function () {
	return name;
};
