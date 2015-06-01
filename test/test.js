var a = require('../');
a.run(function () {
	console.log('test');	
	setInterval(function () {
		console.log(Date.now());
	}, 10000);
});
