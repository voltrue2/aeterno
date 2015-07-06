'use strict';

var SEC_IN_MIL = 1000;
var MIN_IN_MIL = 1000 * 60;
var HOUR_IN_MIL = 1000 * 60 * 60;
var DAY_IN_MIL = 1000 * 60 * 60 * 24;

exports.getTime = function (ms) {
	var days = getDaysFromMillisec(ms);
	var hours = getHoursFromMillisec(days.diff);
	var minutes = getMinutesFromMillisec(hours.diff);
	var sec = getSecFromMillisec(minutes.diff);
	return comma(days.value) + ' days ' +
		hours.value + ' hours ' +
		minutes.value + ' minutes ' +
		sec.value + ' seconds';
};

function getDaysFromMillisec(ms) {
	return calc(ms, DAY_IN_MIL);
}

function getHoursFromMillisec(ms) {
	return calc(ms, HOUR_IN_MIL);
}

function getMinutesFromMillisec(ms) {
	return calc(ms, MIN_IN_MIL);
}

function getSecFromMillisec(ms) {
	return calc(ms, SEC_IN_MIL);
}

function calc(ms, baseTime) {
	var res = {};
	var num = ms / baseTime;
	if (num >= 1) {
		res.value = Math.floor(num);
		res.diff = ms - (baseTime * res.value);
		return res;
	}
	res.value = 0;
	res.diff = ms;
	return res;
}

function comma(n) {
	var str = n.toString();
	var counter = 0;
	var steps = 3;
	var res = '';
	for (var i = str.length - 1; i >= 0; i--) {
		var part = str[i];
		if (counter === steps) {
			part = part + ',';
			counter = 0;
		}
		res = part + res;
		counter += 1;
	}
	return res;
}
