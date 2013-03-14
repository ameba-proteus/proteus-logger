/**
 * File logger which rotate with date pattern
 * uses stream2 to stream logger
 */
var layouts = require('../layouts');
var fs = require('fs');
var path = require('path');

function RotateFileAppender(config, global) {

	// create layout
	var layout = layouts(config.layout, global);

	// date pattern
	var pattern = config.filePattern || '%yyyy-%MM-%dd.log';
	var directory = config.directory || '.';

	// file name replacers
	var fileReplacers = {
		'%yyyy': function(date) {
			return date.getFullYear();
		},
		'%MM': function(date) {
			var month = date.getMonth() + 1;
			if (month < 10) {
				return '0' + month;
			} else {
				return month;
			}
		},
		'%dd': function(date) {
			var day = date.getDate();
			if (day < 10) {
				return '0' + day;
			} else {
				return day;
			}
		},
		'%hh': function(date) {
			var hour = date.getHours();
			if (hour < 10) {
				return '0' + hour;
			} else {
				return hour;
			}
		}
	};

	/**
	 * Get filename from current date time
	 */
	function getFileName() {
		var date = new Date();
		var filename = pattern;
		for (var key in fileReplacers) {
			var replacer = fileReplacers[key];
			filename = filename.replace(key, replacer(date));
		}
		return filename;
	}

	var stream;
	var currentName;

	/**
	 * Appender
	 */
	return function append(level, now, msg, args) {
		// layout
		var line = layout.call(this, level, now, msg, args);
		// get expected name of the log file.
		var expectName = getFileName();
		if (expectName !== currentName) {
			if (stream) {
				stream.end();
			}
			currentName = expectName;
			stream = fs.createWriteStream(
				path.resolve(directory, currentName),
				{ flags: 'a', encoding: 'utf8', mode: 0644 }
			);
		}
		stream.write(line);
	};

}

module.exports = RotateFileAppender;

