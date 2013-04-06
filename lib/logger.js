/**
 * Logger module provides logging proxy to hide complex operation of logging.
 *
 * Logger will use configurator automatically.
 */
var cluster = require('cluster')
  , cli = require('cli-color')
  ;

var appenders = {};
var loggers = {};
var levels = ['debug', 'info' , 'warn'  , 'error', 'fatal'];
var colors = [cli.cyan, cli.green, cli.yellow, cli.red, cli.magenta];

// Default console appender
var defaultAppender = require('./appenders/console')('default', {}, {
	levels: levels,
	colors: colors
});
defaultAppender.level = 0;

// wait to fork
if (cluster.isMaster) {
	cluster.on('fork', function(worker) {
		worker.on('message', function(msg) {
			if ('_PROTEUS_LOG_' in msg) {
				var appender = getAppender(msg.appender);
				if (appender) {
					appender.apply(this, msg.args);
				}
			}
		});
	});
}

var defaultLogger = getLogger('default');

/**
 * configure winston loggers
 */
function configure(config) {

	// override level definitions
	if (config.levels) {
		levels = config.levels;
	}
	// override color definitions
	if (config.colors) {
		colors = [];
		// set functions for each colors
		config.colors.forEach(function(label) {
			colors.push(cli[label]);
		});
	}

	// global configuration for loggers
	var globalConfig = {
		levels: levels,
		colors: colors
	};

	// register transports if master
	var appenderConfigs = config.appenders || {};

	for (var name in appenderConfigs) {
		var appenderConfig = appenderConfigs[name];
		var appenderLevel = (appenderConfig.level) ? levels.indexOf(appenderConfig.level) : 0;
		var appender = require('./appenders/'+appenderConfig.type)(name, appenderConfig, globalConfig);
		appender.level = appenderLevel;
		appenders[name] = appender;
		if (name === 'default') {
			defaultAppender = appender;
		}
	}

	// register loggers
	var loggerConfigs = config.loggers || {};
	for (var loggerName in loggerConfigs) {
		var option = loggerConfigs[loggerName];
		var logger = getLogger(loggerName);
		// apply configuration
		logger.setOption(option);
	}
}

// Logger
function Logger(name) {
	var self = this;
	self.name = name;
	self.option = {};
	// refer to default logger appenders
	self.appenders = [];
	// refer to default logger as default
	if (defaultLogger) {
		self.refer = defaultLogger;
	} else {
		self.appenders = [defaultAppender];
	}
}
Logger.prototype.setOption = function(option) {
	option = option || {};
	// refer another logger
	var self = this;
	if (option.refer) {
		// set refer and return
		self.refer = getLogger(option.refer);
	} else {
		delete self.refer;
	}
	// reset appenders
	self.appenders = [];
	// set level threshold
	self.level = (option.level) ? levels.indexOf(option.level) : 0;
	(option.appenders || []).forEach(function(name) {
		if (name in appenders) {
			self.appenders.push(appenders[name]);
		}
	});
};

// Level writer
for (var i = 0; i < levels.length; i++) {
	var level = levels[i];
	Logger.prototype[level] = log(i);
}

/**
 * Logging
 */
function log(level) {
	return function(msg) {
		var logger = this;
		// max refers to prevent infinite loop
		var max = 10;
		var refer = logger;
		while (logger.refer && --max > 0) {
			// use refered logger
			refer = logger.refer;
		}
		// level check
		if (level < refer.level) {
			// skip if level is lower than configured.
			return;
		}
		var appenders = refer.appenders;
		var now = new Date();
		var args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
		for (var i = 0; i < appenders.length; i++) {
			var appender = appenders[i];
			if (appender.level <= level) {
				appenders[i].call(logger, level, now, msg, args);
			}
		}
	};
}

/**
 * Get the logger
 */
function getLogger(name) {
	if (name in loggers) {
		return loggers[name];
	} else {
		var logger = new Logger(name);
		loggers[name] = logger;
		return logger;
	}
}

/**
 * Get the appender
 */
function getAppender(name) {
	return appenders[name];
}

module.exports = {
	configure: configure,
	get: getLogger,
	appender: getAppender
};
