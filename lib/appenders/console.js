/**
 * Console appender
 */
var layouts = require('../layouts');
var cli = require('cli-color');

function ConsoleAppender(config, global) {

	// create layout
	var layout = layouts(config.layout, global);

	return function append(level, now, msg, args) {
		console.log(layout.call(this, level, now, msg, args));
	}
}

module.exports = ConsoleAppender;
