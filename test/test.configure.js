
var proteusLogger = require('../lib/logger');
var configurator = require('proteus-configurator');
var should = require('should');

describe('logger', function() {
	describe('#configure', function() {
		it('can configure', function() {
			proteusLogger.configure({
				category1: {
					console: {
						level: 'warn',
						colorize: 'true'
					}
				}
			});
			var logger = proteusLogger.logger('category1');
			logger.transports['console']['level'].should.equal('warn');
		});
		it('can configure from configurator', function() {
			configurator.configure(__dirname + '/config/logger.json');
			var logger = proteusLogger.logger('category2');
			logger.transports['console']['level'].should.equal('silly');
		});
	});
});
