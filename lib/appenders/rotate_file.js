/**
 * File logger which rotate with date pattern
 * uses stream2 to stream logger
 */
var layouts = require('../layouts');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var async = require('async');

function RotateFileAppender(name, config, global) {

  // create layout
  var layout = layouts(config.layout, global);

  if (cluster.isWorker) {
    // child workers send log file to parent process
    return function append(level, now, msg, args) {
      var line = layout.call(this, level, now, msg, args);
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
    };
  }

  // date pattern
  var fileName = config.fileName || config.filename || name + '.log';
  var pattern = config.filePattern || config.pattern || name + '.%yyyy-%MM-%dd.log';
  var directory = config.directory || '.';
  var interval = config.interval || 86400000;

  var mainPath = path.resolve(directory, fileName);

  // file name replacers
  var fileReplacers = [{
    key: '%yyyy',
    value: function(date) {
      return date.getFullYear();
    }
  }, {
    key: '%MM',
    value: function(date) {
      var month = date.getMonth() + 1;
      return month < 10 ? '0'+month : ''+month;
    }
  }, {
    key: '%dd',
    value: function(date) {
      var day = date.getDate();
      return day < 10 ? '0'+day : ''+day;
    }
  }, {
    key: '%hh',
    value: function(date) {
      var hour = date.getHours();
      return hour < 10 ? '0'+hour : ''+hour;
    }
  }, {
    key: '%mm',
    value: function(date) {
      var minutes = date.getMinutes();
      return minutes < 10 ? '0'+minutes : ''+minutes;
    }
  }];

  var timeOffset = new Date().getTimezoneOffset() * 60000;

  /**
   * Get current date key
   */
  var getCurrentDate = function(date) {
    return Math.floor((date.getTime() - timeOffset) / interval);
  };

  /**
   * Get filename from current date time
   */
  var getRotatedFileName = function(date) {
    var filename = pattern;
    for (var i = 0; i < fileReplacers.length; i++) {
      var replacer = fileReplacers[i];
      filename = filename.replace(replacer.key, replacer.value(date));
    }
    return filename;
  };

  var stream = null;
  var currentDate = null;
  var lastTime = 0;

  try {
    var stat = fs.statSync(mainPath);
    if (stat) {
      lastTime = stat.mtime;
      currentDate = getCurrentDate(lastTime);
    }
  } catch (e) {
    // ignore stat error
  }

  // open main file
  var open = function() {
    // close if stream is opened
    if (stream) {
      stream.end();
    }
    stream = fs.createWriteStream(
      mainPath,
      { flags: 'a', encoding: 'utf8', mode: 0644 }
    );
  };

  var rename = function(src, dst, callback) {
    fs.rename(src, dst, function(err) {
      if (err) {
        if (err.code === 'EEXIST') {
          // unlink old file if file already exists
          fs.unlink(dst, function(err) {
            if (err) {
              return callback(err);
            } else {
              // rename again
              rename(src, dst, callback);
            }
          });
        } else {
          callback(err);
        }
      } else {
        callback();
      }
    });
  };

  var write = function(line, callback) {
    var ok = stream.write(line);
    if (ok) {
      callback();
    } else {
      // wait to be drained
      stream.once('drain', callback);
    }
  };

  // Create writer queue
  var queue = async.queue(function(line, done) {
    var now = new Date();
    var logDate = getCurrentDate(now);
    if (currentDate === null) {
      // set log date as current date at first
      currentDate = logDate;
    } else if (logDate > currentDate) {
      // switch current log file to rotated name
      if (stream) {
        stream.end();
        stream = null;
      }
      currentDate = logDate;

      var replaceName = getRotatedFileName(lastTime);
      var replacePath = path.resolve(directory, replaceName);

      lastTime = now;

      rename(mainPath, replacePath, function(err) {
        if (err) {
          return done(err);
        }
        open();
        write(line, done);
      });
      return;
    }
    if (stream === null) {
      open();
    }
    lastTime = now;
    write(line, done);
  }, 1);

  /**
   * Appender
   */
  return function append(level, now, msg, args) {
    var line;
    if (arguments.length === 1) {
      line = level;
    } else {
      line = layout.call(this, level, now, msg, args);
    }
    // write to file if this is the master
    queue.push(line);
  };

}

module.exports = RotateFileAppender;

