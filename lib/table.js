'use strict';

/*
Supported structure:
[<stirng>, <string> ...]
*/
module.exports.create = function (list, offsetSpacePerRow) {
	var longest = 0;
	var len = list.length;
	var itemsPerRow = 3;
	var baseSpace = '';
	var table = '';
	var counter = 0;
	for (var s = 0; s < (offsetSpacePerRow || 0); s++) {
		baseSpace += ' ';
	}
	for (var i = 0; i < len; i++) {
		if (longest < list[i].length) {
			longest = list[i].length;
		}
	}
	for (var j = 0; j < len; j++) {
		var space = '  ';
		var item = list[j];
		var diff = longest - item.length;
		counter += 1;
		for (var k = 0; k < diff; k++) {
			space += ' ';
		}
		table += item + space;
		if (counter === itemsPerRow && counter < len) {
			table += '\n' + baseSpace;
			counter = 0;
		}
	}
	return table;
};
