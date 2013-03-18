/**
 * Console appender
 */
var layouts = require('../layouts');

function ConsoleAppender(name, config, global) {

	// create layout
	var layout = layouts(config.layout, global);

	return function append(level, now, msg, args) {
		console.log(layout.call(this, level, now, msg, args));
	};
}

module.exports = ConsoleAppender;
