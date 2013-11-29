/**
 * File logger 
 * uses stream2 to stream logger
 */
var layouts = require('../layouts');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');

function FileAppender(name, config, global) {

  // create layout
  var layout = layouts(config.layout, global);

  // date pattern
  var directory = config.directory || '.';
  var filename = config.filename;
  var fileappend = !!config.append;

  var stream;

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

    var opts = { encoding: 'utf8', mode: 0644 };
    if (fileappend) {
      opts.flags = 'a';
    }

    // write to file if this is the master
    if (cluster.isMaster) {
      // get expected name of the log file.
      if (!stream) {
        stream = fs.createWriteStream(
          path.resolve(directory, filename),
          opts
        );
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

module.exports = FileAppender;

