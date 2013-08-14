/**
 * File logger which rotate with date pattern
 * uses stream2 to stream logger
 */
var layouts = require('../layouts');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');

function RotateFileAppender(name, config, global) {

	// create layout
	var layout = layouts(config.layout, global);

	// date pattern
	var pattern = config.filePattern || '%yyyy-%MM-%dd.log';
	var directory = config.directory || '.';

	// symlink option
	var symlink = config.symlink && config.symlink.current;

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

		var line;

		if (arguments.length === 1) {
			// string specified
			line = level;
		} else {
			// layout
			line = layout.call(this, level, now, msg, args);
		}

		// write to file if this is the master
		if (cluster.isMaster) {
			// get expected name of the log file.
			var expectName = getFileName();
			if (expectName !== currentName) {
				if (stream) {
					stream.end();
				}
				currentName = expectName;
				var filePath = path.resolve(directory, currentName);
				stream = fs.createWriteStream(
					filePath,
					{ flags: 'a', encoding: 'utf8', mode: 0644 }
				);
				if (symlink) {
					var linkPath = path.resolve(directory, symlink);
					// unlink current symlink if it already exists
					if (fs.existsSync(linkPath)) {
						fs.unlinkSync(linkPath);
					}
					// create symlink to the new destination
					fs.symlinkSync(filePath, linkPath);
				}
			}
			stream.write(line);

		} else {
			// send to master
			try {
				process.send({
					_PROTEUS_LOG_: 1,
					appender: name,
					args: [line]
				});
			} catch (e) {
				// ignore channel error
			}
		}
	};

}

module.exports = RotateFileAppender;

