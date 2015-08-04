'use strict';

var fs = require('fs');
var print = require('./print');
var modName = require('./modname');
var options = {
	flags: 'a',
	mode: parseInt('0644', 8),
	encoding: 'utf8'
};

module.exports = Message;

function Message(appPath) {
	var prefix = '/tmp/' + modName.get() + '-message-';
	this._appPath = appPath;
	this._name = prefix + this._appPath.replace(/\//g, '-') + '.msg';
	this._stream = null;
	// set up cleaning on process exit
	var that = this;
	process.on('exit', function (error) {
		if (error) {
			print.error(print.r(error.message));
			print.error(print.r(error.stack));
		}
		that.stop();
	});
}

Message.prototype.startSend = function () {
	if (this._stream) {
		return;
	}
	this._stream = fs.createWriteStream(this._name, options);
};

Message.prototype.read = function (onData, cb) {
	if (this._stream) {
		return;
	}
	var that = this;
	// make sure the message file is created
	this._stream = fs.createWriteStream(this._name, options);
	// now listen for file change
	this._stream.on('open', function () {
		var watch = fs.watch(that._name, function (event) {
			if (event !== 'change') {
				return;
			}
			fs.readFile(that._name, function (error, data) {
				if (error || !data) {
					onData(null);
					return watch.close();
				}
				try {
					var msg = JSON.parse(data.toString());
					onData(msg);
				} catch (e) {
					onData(null);
				}
				watch.close();
			});
		});
		if (cb) {
			cb();
		}
	});
	this._stream.end();
};

Message.prototype.send = function (msg) {
	if (this._stream) {
		this._stream.write(JSON.stringify({ app: this._appPath, msg: msg }));
		this._stream.end();
	}
};

Message.prototype.stop = function () {
	if (this._stream) {
		this._stream = null;
		try {
			fs.unlinkSync(this._name);
		} catch (error) {
			print.error(print.r('Message socket file not found at: ' + this._name));			
			print.error(print.r(error.message));			
			print.error(print.r(error.stack));			
		}
	}
};
