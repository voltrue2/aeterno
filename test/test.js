var fs = require('fs');
var a = require('../');
a.setName('test');
a.setApplicationPath('test/test.js');
a.run(function () {
	var interval = setInterval(function () {
		var now = Date.now();
		console.log(now, (process.argv[2] || 'no file'));
		if (process.argv[2] === '--write') {
			console.log('writting:', now);
			fs.writeFileSync(__dirname + '/test.txt', now + '\n');
		}
		
	}, 1000);
	var interval2 = setInterval(function () {
		var now = Date.now();
		console.error('**Error:', now, (process.argv[2] || 'no file'));
		if (process.argv[2] === '--write') {
			console.error('writting:', now);
			fs.writeFileSync(__dirname + '/test.txt', '** Error:' + now + '\n');
		}
		
	}, 2000);
	process.on('SIGINT', function () {
		clearInterval(interval);
		clearInterval(interval2);
		console.log('stop');
		process.exit();
	});
	process.on('SIGHUP', function () {
		clearInterval(interval);
		clearInterval(interval2);
		console.log('reload');
		process.exit();
	});
});
