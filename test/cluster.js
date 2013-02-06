
var cluster = require('cluster');
var loggers = require('../');
	var logger = loggers.get();

if (cluster.isMaster) {
	logger.info('starting worker');
	cluster.fork();
} else {
	logger.info('test message', {name:'value'});
	setTimeout(function() {
		process.kill();
	}, 100);
}

