var fs = require('fs');
var a = require('../');
a.setName('test');
a.setApplicationPath('test/test.js');
a.run(function () {
	var interval = setInterval(function () {
		var now = Date.now();
		console.log(now, process.argv[2]);
		if (process.argv[2] === '--write') {
			console.log('writting:', now);
			fs.writeFileSync(__dirname + '/test.txt', now + '\n');
		}
		
	}, 100);
	process.on('SIGHUP', function () {
		clearInterval(interval);
		console.log('reload');
		process.exit();
	});
});
