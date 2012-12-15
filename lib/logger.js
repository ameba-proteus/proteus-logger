/**
 * Logger module provides logging proxy to hide complex operation of logging.
 *
 * Logger will use configurator automatically.
 */
var winston = require('winston')
  , configurator = require('proteus-configurator')
  , cluster = require('cluster')
  ;

var WORKER_MESSAGE_LOG = '__LOG__';
var CONFIGURATOR_KEY_LOGGER = 'logger';

var workerLoggerCache = {};
var loggers = winston.loggers;

// configure logger from configurator
configurator.on(CONFIGURATOR_KEY_LOGGER, function(vars) {
	configure(vars);
});

winston.loggers.add('default', {
	console: {
		level: 'debug',
		colorize: true,
		timestamp: true
	}
});

/**
 * create worker logger to send log messages to master
 * @param {Logger} logger
 */
function createWorkerLogger(name, logger) {
	var wrapper = this;
	// wrap all properties
	for (var attr in logger) {
		this[attr] = logger[attr];
	}
	// override logger.log() function
	wrapper[log] = function(level, msg, meta, callback) {
		process.send({cmd: WORKER_MESSAGE_LOG, logger: name, level: level, msg: msg, meta: meta});
	}
	// override logger[level] functions
	Object.keys(logger.levels).forEach(function(level) {
		wrapper[level] = function(msg, meta, callback) {
			process.send({cmd: WORKER_MESSAGE_LOG, logger: name, level: level, msg: msg, meta: meta});
		};
	});
	return wrapper;
}

/**
 * configure winston loggers
 */
function configure(config) {
	for (var name in config) {
		var options = config[name];
		// remove existing logger
		if (winston.loggers.has(name)) {
			winston.loggers.close(name);
		}
		winston.loggers.add(name, options);
		if (cluster.isWorker) {
			delete workerLoggerCache[name];
		}
	}
}

function getLogger(name) {
	return loggers.has(name) ? loggers.get(name) : defaultLogger;
}

/**
 * get configured logger
 */
function logger(name) {
	name = name || 'default';

	// worker uses master integrate logger
	if (cluster.isWorker) {
		if (workerLoggerCache[name]) {
			return workerLoggerCache[name];
		} else {
			var logger = winston.loggers.get(name);
			var workerLogger = createWorkerLogger(name, logger);
			workerLoggerCache[name] = workerLogger;
			return workerLogger;
		}
	} else {
		return winston.loggers.get(name);
	}
}

module.exports = {
	configure: configure,
	get: get
};
