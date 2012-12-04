
var logger = require('../lib/logger');
var configurator = require('proteus-configurator');

describe('logger', function() {
	describe('#configure', function() {
		it('can configure', function() {
			logger.configure({
				category1: {
					console: {
						level: 'warn',
						colorize: 'true'
					}
				}
			});
			var log = logger.get('category1');
			log.transports['console']['level'].should.equal('warn');
		});
		it('can configure from configurator', function() {
			configurator.configure('./test/config/logger.json');
			var log = logger.get('category2');
			log.transports['console']['level'].should.equal('silly');
		});
	});
});
