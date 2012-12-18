var proteusLogger = require('../lib/logger');

proteusLogger.configure({
	category1: {
		dailyRotateFile: {
			level: 'warn',
			colorize: 'true',
			filename: 'dailyRotateFile.log',
			datePattern: '.yyyy-MM-dd-HH-mm',
			maxsize: 20000
		}
	}
});

var logger = proteusLogger.get('category1');
function logMessage() {
	setTimeout(function() {
		logger.debug('hoge');
		logMessage();
	}, 100);
}
logMessage();


