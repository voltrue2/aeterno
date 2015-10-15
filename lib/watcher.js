'use strict';

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var watched = [];

exports.start = function (path) {
	var event = new EventEmitter();
	watched = [];
	startWatch(path, event);
	return event;
};

exports.stop = function (path, cb) {
	stopWatch(path, cb);
};

exports.getWatched = function () {
	return watched;
};

function startWatch(path, event) {
	/*
	var stat = fs.statSync(path);
	if (stat.isDirectory()) {
		watch(path, event);
		var list = fs.readdirSync(path);
		for (var i = 0, len = list.length; i < len; i++) {
			startWatch(setPath(path, list[i]), event);
		}
	}
	*/
	watch(path, event);
}

function watch(path, event) {
	var st = {
		mtime: 0,
		ctime: 0,
		files: [],
		map: {}
	};
	var isDir = fs.statSync(path).isDirectory();
	watched.push(path);
	
	if (isDir) {
		var initList = fs.readdirSync(path);
		for (var h = 0, hen = initList.length; h < hen; h++) {
			var fpath = initList[h];
			var fullPath = setPath(path, fpath);
			st.files.push(fpath);
			if (fs.statSync(fullPath).isDirectory()) {
				st.map[fpath] = 0;
				continue;
			}
			st.map[fpath] = getSize(fullPath);
		}
	} else {
		st.files.push(path);
		st.map[path] = getSize(path);
	}

	fs.watchFile(path, function (status) {
		var mtime = status.mtime.getTime();
		var ctime = status.ctime.getTime();
		if (status.nlink !== 0 && mtime !== st.mtime && ctime !== st.ctime) {

			st.mtime = mtime;
			st.ctime = ctime;	
		
			var changed = detectChange(event, st, isDir, path);
	
			if (changed.length) {
				event.emit('change', path, changed);
			}
		}
	});
}

function detectChange(event, st, isDir, path) {
	var changed = [];
	var list;	

	// path is a file
	if (!isDir) {
		list = [path];	
	} else {
		// path is a directory
		list = fs.readdirSync(path);
		// ignore dotted files
		list = list.filter(function (item) {
			return item[0] !== '.';
		});
	}

	// look for removed files/dirs
	var removed = detectRemoved(st, list, path, changed);
	st = removed.st;
	changed = removed.changed;
	// look for new files/directories or changes
	var updated = detectUpdated(st, list, path, event, changed);
	st = updated.st;
	changed = updated.changed;

	return changed;
}

function detectRemoved(st, list, path, changed) {
	for (var i = 0, len = st.files.length; i < len; i++) {
		var filePath = st.files[i];
		if (!filePath) {
			// already removed
			continue;
		}
		var cPath = setPath(path, filePath);
		var index = list.indexOf(filePath);
		if (index === -1) {
			// removed
			st.files.splice(index, 1);
			delete st.map[filePath];
			changed.push({ file: cPath, type: 'remove' });
		}
	}
	//st.files = tmp;
	return {
		st: st,
		changed: changed
	};
}

function detectUpdated(st, list, path, event, changed) {
	for (var i = 0, len = list.length; i < len; i++) {
		var filePath = list[i];
		var cPath = setPath(path, filePath);
		var isDir = fs.statSync(cPath).isDirectory();
		if (!st.map.hasOwnProperty(filePath)) {
			// new file/directory
			st.files.push(filePath);
			changed.push({ file: cPath, type: 'add' });
			watch(cPath, event);
			if (isDir) {
				st.map[filePath] = 0;	
				continue;
			}
			st.map[filePath] = getSize(cPath);
			
		} else {
			// file change
			if (!isDir) {
				var currentSize = getSize(cPath);
				var size = st.map[filePath] || 0;
				if (currentSize !== size) {
					st.map[filePath] = currentSize;
					changed.push({ file: cPath, type: 'change' });
				}
			}
		}

	}
	return {
		st: st,
		changed: changed
	};
}

function getSize(path) {
	return fs.readFileSync(path).length;
}

function stopWatch(path) {
	var stat = fs.statSync(path);
	if (stat.isDirectory()) {
		unwatch(path);
		var list = fs.readdirSync(path);
		for (var i = 0, len = list.length; i < len; i++) {
			stopWatch(setPath(path, list[i]));
		}
	}
}

function unwatch(path) {
	var index = watched.indexOf(path);
	watched.splice(index, 1);
	fs.unwatchFile(path);
}

function setPath(pre, path) {
	if (pre === path) {
		return pre;
	}
	var slash = pre[pre.length - 1] === '/' ? '' : '/';
	return pre + slash + path;
}
