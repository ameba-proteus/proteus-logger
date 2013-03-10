
var proteusLogger = require('../lib/logger');
var should = require('should');

describe('logger', function() {
	describe('#configure', function() {
		it('can configure', function(done) {
			proteusLogger.configure({
				appenders: {
					con: {
						type: 'console'
					}
				},
				loggers: {
					category1: {
						appenders: ['con']
					}
				}
			});
			var logger = proteusLogger.get('category1');
			logger.info('test test test');
			logger.error('test test test', new Error("YOYO"));
			logger.warn('test test test');
			logger.debug('test test test');
			logger.fatal('test test test');
			done();
		});
	});
});
