
var layouts = require('../layouts');

/**
 * Appender for worker process
 */
function WorkerAppender(config, global) {

	config = config || {};
	global = global || {};

	if (!config.layout) {
		// default pattern
		config.layout = {
			pattern: layouts.defaultPattern
		};
	}

	var layoutConfig = config.layout || {};
	layoutConfig.object = true;

	var layout = layouts(layoutConfig, global);

	return function append(level, now, msg, args) {
		var obj = layout.call(this, level, now, msg, args);
		try {
			process.send({
				type: '_PROTEUS_LOG_',
				logger: this.name,
				level: level,
				data: obj
			});
		} catch (e) {
			// ignore channel closed
		}
	};

}

module.exports = WorkerAppender;
