
var cluster = require('cluster');
var loggers = require('../');

loggers.configure({
  appenders: {
    con: {
      type: 'console',
    },
    /*
    file: {
      type: 'file',
      directory: '.',
      filename: 'test.log',
      layout: {
        pattern: '%utctime %pid %level %logger %msg %args (%line)%nstack%n'
      }
    },
    */
    file: {
      type: 'rotate_file',
      directory: '.',
      filename: 'rotate.log',
      pattern: 'rotate.%yyyy-%MM-%dd-%mm.log',
      interval: 60000,
      layout: {
        pattern: '%utctime %pid %level %logger %msg %args (%line)%nstack%n'
      }
    }
  },
  loggers: {
    default: {
      appenders: ['con','file']
    }
  }
});

var num = 5;

if (cluster.isMaster) {

  for (var i = 0; i < num; i++) {
    cluster.fork();
  }

} else {

  var logger = loggers.get();

  setInterval(function() {
    logger.info("TEST OUT");
  }, 100);

  setTimeout(function() {
    process.exit(0);
  }, 1000000);

}
