var fs = require('fs');
var print = require('./print');
var posMap = {};

function tail(path, cb) {
	fs.readdir(path, function (error, list) {
		if (error) {
			return cb(error);
		}
		for (var i = 0, len = list.length; i < len; i++) {
			var filePath = path + list[i];
			posMap[filePath] = 0;
			fs.watch(filePath, delegate(filePath, tailer));
			print.out(print.g('Tailing: ' + filePath));
		}
	});	
}

function delegate(filePath, cb) {
	return function (event) {
		cb(event, filePath);
	};
}

function tailer(event, filePath) {
	fs.readFile(filePath, 'utf8', function (error, data) {
		if (error) {
			return print.error(
				'Error tailing: ' + filePath + ' ' + error.message
			);
		}
		if (event === 'change') {
			data = data.split('\n');
			var toOutput = data.splice(posMap[filePath]);
			print.out(toOutput.join('\n'));
			// update file position
			posMap[filePath] = data.length - 1;
		}
	});
}

module.exports = tail;
