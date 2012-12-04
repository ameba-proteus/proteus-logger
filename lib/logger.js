/**
 * Logger module provides logging proxy
 * to hide complex operation of logging.
 *
 * Logger will use configurator automatically.
 *
 * TODO
 * Child processes have to send logs to the parent process.
 */
var winston = require('winston');
var configurator = require('proteus-configurator');
var cluster = require('cluster');

var WORKER_MESSAGE_LOG = 'LOG';
var CONFIGURATOR_KEY_LOGGER = 'logger';

var workerLoggerCache = {};

// configure logger from configurator
configurator.on(CONFIGURATOR_KEY_LOGGER, function(vars) {
	configure(vars);
});

/**
 * create worker logger to send log messages to master
 * @param {Logger} logger
 */
function createWorkerLogger(logger) {
	var wrapper = this;
	// wrap all properties
	for (var attr in logger) {
		this[attr] = logger[attr];
	}
	// override logger.log() function
	wrapper[log] = function(level, msg, meta, callback) {
		process.send({cmd: WORKER_MESSAGE_LOG, level: level, msg: msg, meta: meta});
	}
	// override logger[level] functions
	Object.keys(logger.levels).forEach(function(level) {
		wrapper[level] = function(msg, meta, callback) {
			process.send({cmd: WORKER_MESSAGE_LOG, level: level, msg: msg, meta: meta});
		};
	});
	return wrapper;
}

var defaultLogger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			timestamp: true
		})
	]
});
var defaultWorkerLogger = createWorkerLogger(defaultLogger);

/**
 * configure winston loggers
 */
function configure(config) {
	for (var name in config) {
		var options = config[name];
		winston.loggers.add(name, options);
	}
	if (!config['default']) {
		// configure default logger if not specified
		winston.loggers.add('default', {
			console: {
				colorize: true,
				timestamp: true
			}
		});
		defaultLogger = winston.loggers.get('default');
		defaultWorkerLogger = createWorkerLogger(defaultLogger);
	}
}

/**
 * get configured logger
 */
function get(name) {

	// set default if name is not defined
	if (!name) {
		// worker uses master integrate logger
		if (cluster.isWorker) {
			return defaultWorkerLogger;
		}
		return defaultLogger;
	}
	var logger = winston.loggers.get(name);

	// worker uses master integrate logger
	if (cluster.isWorker) {
		if (workerLoggerCache[name]) {
			return workerLoggerCache[name];
		} else {
			var workerLogger = createWorkerLogger(logger);
			workerLoggerCache[name] = workerLogger;
			return workerLogger;
		}
	}
	return logger;
}

module.exports = {
	configure: configure,
	get: get
};
