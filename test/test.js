var a = require('../');
a.setName('test');
a.run(function () {
	var interval = setInterval(function () {
		console.log(Date.now());
	}, 10000);
	process.on('SIGHUP', function () {
		clearInterval(interval);
		console.log('reload');
		process.exit();
	});
});
