
var chalk = require('chalk');

var DEFAULT_PATTERN = '%yyyy-%MM-%dd%T%HH:%mm:%ss %pid %levelc %loggerc %msg %argsc (%linec)%nstack';

var EOL = require('os').EOL;
var path = require('path');

/**
 * Format layouts
 */
function createLayout(layoutConfig, globalConfig) {

  layoutConfig = layoutConfig || {};

  if (layoutConfig.json) {
    return jsonLayout(layoutConfig, globalConfig);
  }

  layoutConfig.pattern = layoutConfig.pattern ||
    globalConfig.pattern ||
    DEFAULT_PATTERN;

  return patternLayout(layoutConfig, globalConfig);

}

function jsonLayout(layoutConfig, globalConfig) {

  var jsonConf = layoutConfig.json;
  var levels = globalConfig.levels;

  var timeKey = jsonConf.time_key || '_time';
  var msgKey = jsonConf.message_key || '_message';
  var levelKey = jsonConf.level_key;
  var loggerKey = jsonConf.logger_key;
  var lineKey = jsonConf.line_key;
  var errorKey = jsonConf.error_key;
  var stackKey = jsonConf.stack_key;
  var pidKey = jsonConf.pid_key;
  var argsKey = jsonConf.args_key || '_args';
  var timeFormat = timeFormatter(jsonConf.time_pattern);
  var eol = jsonConf.eol === true;

  // for master
  return function(level, now, msg, args) {

    var argc = {}, i;
    argc[timeKey] = timeFormat(now);
    // overwrite arguments
    if (levelKey) {
      argc[levelKey] = levels[level];
    }
    if (msgKey && msg) {
      argc[msgKey] = msg;
    }
    if (loggerKey) {
      var logger = this;
      argc[loggerKey] = logger.name || '-';
    }
    if (lineKey) {
      var stack = new Error().stack;
      if (stack) {
        stack = stack.split('\n')[5];
        if (stack && stack.match(/\/([^\/]+?:[0-9]+)/)) {
          argc[lineKey] =  RegExp.$1;
        }
      } else {
        argc[lineKey] = 'unknown';
      }
    }
    if (errorKey) {
      if (msg && msg.message) {
        argc[errorKey] =  msg.message;
      } else {
        for (i = 0; i < args.length; i++) {
          if (args[i] && args[i].message) {
            argc[errorKey] =  args[i].message;
            break;
          }
        }
      }
    }
    if (stackKey) {
      if (msg && msg.stack) {
        argc[stackKey] =  msg.stack;
      } else {
        for (i = 0; i < args.length; i++) {
          if (args[i] && args[i].stack) {
            argc[stackKey] =  args[i].stack;
            break;
          }
        }
      }
    }
    if (pidKey) {
      argc[pidKey] = ''+process.pid;
    }

    for (i = 0; i < args.length; i++) {
      var arg = args[i];
      if (typeof arg === 'object') {
        for (var name in arg) {
          argc[name] = arg[name];
        }
      } else {
        argc[argsKey] = argc[argsKey] || [];
        argc[argsKey].push(arg);
      }
    }

    var json = JSON.stringify(argc);
    if (eol) {
      return json + EOL;
    } else {
      return json;
    }
  };
}

/**
 * Create pattern layout from string format
 */
function patternLayout(layoutConfig, globalConfig) {

  var pattern = layoutConfig.pattern;
  var levels = globalConfig.levels;
  var colors = globalConfig.colors;
  var basedir = globalConfig.basedir || process.cwd();

  var formatters = {
    utctime: function(level, now) {
      return now.toISOString();
    },
    yyyy: function(level, now) {
      return now.getFullYear();
    },
    MM: function(level, now) {
      return padZero(now.getMonth()+1, 2);
    },
    dd: function(level, now) {
      return padZero(now.getDate(), 2);
    },
    T: function() {
      return 'T';
    },
    HH: function(level, now) {
      return padZero(now.getHours(), 2);
    },
    hh: function(level, now) {
      return padZero(now.getHours()%12, 2);
    },
    mm: function(level, now) {
      return padZero(now.getMinutes(), 2);
    },
    ss: function(level, now) {
      return padZero(now.getSeconds(), 2);
    },
    sss: function(level, now) {
      return padZero(now.getMilliseconds(), 3);
    },
    Z: function(level, now) {
      var offset = -now.getTimezoneOffset();
      if (offset === 0) {
        return 'Z';
      }
      var hour = Math.abs(offset / 60);
      var min = Math.abs(offset % 60);
      var sign = offset < 0 ? '-' : '+';
      return sign + padZero(hour, 2) + ':' + padZero(min, 2);
    },
    level: function(level) {
      return levels[level];
    },
    levelc: function(level) {
      return colors[level](levels[level]);
    },
    msg: function(level, now, msg) {
      return msg;
    },
    logger: function() {
      var logger = this;
      return logger.name || '-';
    },
    loggerc: function() {
      var logger = this;
      return chalk.gray(logger.name || '-');
    },
    args: function(level, now, msg, args) {
      return join(args);
    },
    argsc: function(level, now, msg, args) {
      return chalk.magenta(join(args));
    },
    line: function() {
      var stack = new Error().stack;
      if (stack) {
        stack = stack.split('\n')[5];
        if (stack && stack.match(/\/([^\/]+?:[0-9]+)/)) {
          return RegExp.$1;
        }
      }
      return 'unknown';
    },
    linec: function() {
      var stack = new Error().stack;
      if (stack) {
        stack = stack.split('\n')[5];
        if (stack && stack.match(/\/([^\/]+?:[0-9]+)/)) {
          return chalk.gray(RegExp.$1);
        }
      }
      return chalk.gray('unknown');
    },
    path: function() {
      var stack = new Error().stack;
      if (stack) {
        stack = stack.split('\n')[5];
        if (stack && stack.match(/(\/.+?:[0-9]+)/)) {
          return path.relative(basedir, RegExp.$1);
        }
      }
      return 'unknown';
    },
    pathc: function() {
      var stack = new Error().stack;
      if (stack) {
        stack = stack.split('\n')[5];
        if (stack && stack.match(/(\/.+?:[0-9]+)/)) {
          return chalk.gray(path.relative(basedir, RegExp.$1));
        }
      }
      return chalk.gray('unknown');
    },
    error: function(level, now, msg, args) {
      if (msg && msg.message) {
        return msg.message;
      }
      for (var i = 0; i < args.length; i++) {
        if (args[i] && args[i].message) {
          return args[i].message;
        }
      }
      return '';
    },
    stack: function(level, now, msg, args) {
      if (msg && msg.stack) {
        return msg.stack.replace(/\n/g,'\\n');
      }
      for (var i = 0; i < args.length; i++) {
        if (args[i] && args[i].stack) {
          return args[i].stack.replace(/\n/g,'\\n');
        }
      }
      return '';
    },
    nstack: function(level, now, msg, args) {
      if (msg && msg.stack) {
        return '\n'+msg.stack;
      }
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg && args[i].stack) {
          return '\n' + args[i].stack;
        }
      }
      return '';
    },
    pid: function() {
      return ''+process.pid;
    },
    n: function n() {
      return EOL;
    }
  };
  for (var name in formatters) {
    formatters[name]._name = name;
  }

  var list = [];
  var curr = 0;

  pattern.replace(/%([a-zA-Z]+)/g, function(text, match, offset, whole) {
    if (offset > curr) {
      list.push(whole.substring(curr, offset));
    }
    var format = formatters[match];
    if (format) {
      list.push(format);
    } else {
      list.push(text);
    }
    curr = offset + text.length;
  });
  if (curr < pattern.length) {
    list.push(pattern.substring(curr));
  }

  if (layoutConfig.object) {
    // for worker
    return function() {
      var args = arguments;
      var obj = {};
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item._name) {
          obj[item._name] = item.apply(this, args);
        }
      }
      return obj;
    };
  } else {
    // for master
    return function() {
      var args = arguments;
      if (args.length === 4) {
        var obj = args[2];
        if (obj && obj.type === '_PROTEUS_LOG_') {
          var data = obj.data;
          var line = pattern;
          for (var name in data) {
            line = line.replace('%'+name, data[name]);
          }
          return line;
        }
      }

      // parse and composite log text
      var text = '';
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (typeof item === 'function') {
          text += item.apply(this, args);
        } else {
          if (item) {
            text += item;
          }
        }
      }
      return text;
    };
  }
}

function padZero(number, length) {
  var text = String(number);
  while (text.length < length) {
    text = '0' + text;
  }
  return text;
}

function join(args, delimiter) {
  var line = '';
  delimiter = delimiter || ' ';
  for (var i = 0; i < args.length; i++) {
    if (i > 0) {
      line += delimiter;
    }
    var arg = args[i];
    line += convert(arg);
  }
  return line;
}

function convert(object) {
  var type = typeof object;
  if (type === 'string') {
    return object;
  } else if (type === 'number') {
    return String(object);
  } else if (type === 'function') {
    // recursively returns object
    return convert(object());
  } else {
    if (object instanceof Error) {
      // skip error (use %error to print error message)
      return '';
    } else {
      // stringify
      if (object) {
        var line = '';
        for (var name in object) {
          if (line.length > 0) {
            line += ' ';
          }
          var value = object[name];
          line += name + '='  + JSON.stringify(value);
        }
        return line;
      }
    }
  }
}

function timeFormatter(pattern) {
  var formatters = {
    utctime: function(now) {
      return now.toISOString();
    },
    yyyy: function(now) {
      return now.getFullYear();
    },
    MM: function(now) {
      return padZero(now.getMonth()+1, 2);
    },
    dd: function(now) {
      return padZero(now.getDate(), 2);
    },
    T: function() {
      return 'T';
    },
    HH: function(now) {
      return padZero(now.getHours(), 2);
    },
    hh: function(now) {
      return padZero(now.getHours()%12, 2);
    },
    mm: function(now) {
      return padZero(now.getMinutes(), 2);
    },
    ss: function(now) {
      return padZero(now.getSeconds(), 2);
    },
    sss: function(now) {
      return padZero(now.getMilliseconds(), 3);
    },
    Z: function(now) {
      var offset = -now.getTimezoneOffset();
      if (offset === 0) {
        return 'Z';
      }
      var hour = Math.abs(offset / 60);
      var min = Math.abs(offset % 60);
      var sign = offset < 0 ? '-' : '+';
      return sign + padZero(hour, 2) + ':' + padZero(min, 2);
    }
  };

  if (!pattern) {
    return function(now) {
      return now.toISOString();
    };
  }

  var list = [];
  var curr = 0;

  pattern.replace(/%([a-zA-Z]+)/g, function(text, match, offset, whole) {
    if (offset > curr) {
      list.push(whole.substring(curr, offset));
    }
    var format = formatters[match];
    list.push(format || text);
    curr = offset + text.length;
  });
  if (curr < pattern.length) {
    list.push(pattern.substring(curr));
  }

  return function(now) {
    var text = '';
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (typeof item === 'function') {
        text += item.apply(this, [ now ]);
      } else if (item) {
        text += item;
      }
    }
    return text;
  };
}

module.exports = createLayout;

createLayout.defaultPattern = DEFAULT_PATTERN;
