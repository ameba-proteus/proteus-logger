/**
 * Logger module provides logging proxy
 * to hide complex operation of logging.
 *
 * Logger will use configurator automatically.
 */
var winston = require('winston');
var configurator = require('proteus-configurator');
var cluster = require('cluster');

var WORKER_MESSAGE_LOG = 'LOG';
var CONFIGURATOR_KEY_LOGGER = 'logger';

var wrappers = {};

// configure logger from configurator
configurator.on(CONFIGURATOR_KEY_LOGGER, function(vars) {
	configure(vars);
});

/**
 * wrap winston logger as worker logger.
 * @param logger Logger logger which is wrapped
 * @param wrapper Wrapper wrapper. it will be created new wrapper.
 */
function wrapWorkerLogger(logger, wrapper) {
	wrapper = wrapper || {};
	// wrap all properties
	for (var attr in logger) {
		wrapper[attr] = logger[attr];
	}
	// override logger.log() function
	wrapper.log = function log(level, msg, meta, callback) {
		process.send({cmd: WORKER_MESSAGE_LOG, level: level, msg: msg, meta: meta});
	}
	// override logger[level] functions
	Object.keys(logger.levels).forEach(function(level) {
		wrapper[level] = function(msg, meta, callback) {
			this.log(level, msg, meta, callback);
		};
	});
	return wrapper;
}

/**
 * wrap winston logger as master logger
 */
function wrapMasterLogger(logger, wrapper) {
	wrapper = wrapper || {};
	// wrap all properties
	for (var attr in logger) {
		wrapper[attr] = logger[attr];
	}
	// override logger.log(0 function
	wrapper.log = function log(level, msg, meta, callback) {
		logger.log(level, msg, meta, callback);
	};
	// override logger[level] functions
	Object.keys(logger.levels).forEach(function(level) {
		wrapper[level] = function(msg, meta, callback) {
			this.log(level, msg, meta, callback);
		};
	});
	return wrapper;
}

/**
 * default winston logger
 */
winston.loggers.add('default', {
	console: {
		colorize: true,
		timestamp: defaultTimestamp
	}
});

function fillZero(number,length) {
	var str = String(number);
	while (str.length < length) {
		str = '0'+str;
	}
	return str;
}

function defaultTimestamp(date) {
	date = date || new Date();
	return date.getFullYear() + '-' +
		fillZero(date.getMonth()+1,2) + '-' +
		fillZero(date.getDate(),2) + ' ' +
		fillZero(date.getHours(), 2) + ':' +
		fillZero(date.getMinutes(), 2) + ':' +
		fillZero(date.getDay(), 2);
}

/**
 * configure winston loggers
 */
function configure(config) {
	// register winston loggers
	for (var name in config) {
		var options = config[name];
		winston.add(name, options);
		var wrapper = wrappers[name];
		if (wrapper) {
			var logger = winston.loggers.get(name);
			if (logger) {
				if (cluster.isWorker) {
					wrapWorkerLogger(logger, wrapper);
				} else {
					wrapMasterLogger(logger, wrapper);
				}
			}
		}
	}
}

/**
 * get winston logger.
 * return default logger if not configured
 */
function getWinstonLogger(name) {
	return winston.loggers.has(name) ? winston.loggers.get(name) : defaultLogger;
}

/**
 * get the wrapper for the logger.
 * @param name String logger name
 */
function getWrapper(name) {
	var wrapper = wrappers[name];
	if (wrapper) {
		return wrapper;
	}
	var logger = (cluster.isWorker) ?
		wrapWorkerLogger(getWinstonLogger(name)): 
		wrapMasterLogger(getWinstonLogger(name));
	wrappers[name] = logger;
	return logger;
}

/**
 * get configured logger
 */
function get(name) {
	// set default if name is not defined
	name = name || 'default';
	// worker uses master integrate logger
	return getWrapper(name);
}

module.exports = {
	configure: configure,
	get: get
};
