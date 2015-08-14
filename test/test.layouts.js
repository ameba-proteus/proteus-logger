'use strict';
/*global describe:true,it:true*/

var path = require('path');

var chalk = require('chalk');
var expect = require('expect.js');

var createLayout = require('../lib/layouts');

var globalConfig = {
  levels: ['debug', 'info' , 'warn', 'error', 'fatal'],
  colors: [chalk.cyan, chalk.green, chalk.yellow, chalk.red, chalk.magenta]
};

describe('layouts', function() {

  describe('json format', function() {
    it('simple layout', function() {
      var layout = createLayout({
        json: {
          eol: true
        }
      }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var actual = JSON.parse(result);
      expect(actual._time).to.eql(date.toISOString());
      expect(actual._message).to.eql('test test test');
    });

    it('custom key name', function() {
      var layout = createLayout({
        json: {
          time_key: 'custom_time',
          message_key: 'custom_message',
          eol: true
        }
      }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var actual = JSON.parse(result);
      expect(actual.custom_time).to.eql(date.toISOString());
      expect(actual.custom_message).to.eql('test test test');
    });

    it('many arguments', function() {
      var layout = createLayout({
        json: {
          args_key: 'other_contents',
          eol: true
        },
      }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', [
        { test: 'hoge' },
        'fuga',
        1,
        true
      ]);
      expect(result).to.be.ok();
      var actual = JSON.parse(result);
      expect(actual._time).to.eql(date.toISOString());
      expect(actual._message).to.eql('test test test');
      expect(actual.test).to.eql('hoge');
      expect(actual.other_contents).to.eql([ 'fuga', 1, true ]);
    });

    it('custom time format', function() {
      var layout = createLayout({
        json: {
          time_pattern: '%yyyy/%MM/%dd %HH:%mm:%ss.%sss',
          eol: true
        }
      }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var actual = JSON.parse(result);
      var nowStr = (function() {
        function padZero(number, length) {
          var text = String(number);
          while (text.length < length) {
            text = '0' + text;
          }
          return text;
        }

        return date.getFullYear() + '/' +
          padZero((date.getMonth() + 1), 2) + '/' +
          padZero(date.getDate(), 2) + ' ' +
          padZero(date.getHours(), 2) + ':' +
          padZero(date.getMinutes(), 2) + ':' +
          padZero(date.getSeconds(), 2) + '.' +
          padZero(date.getMilliseconds(), 3);
      })();

      expect(actual._time).to.eql(nowStr);
    });
  });

  describe('string format', function() {
    it('%utctime', function() {
      var layout = createLayout({ pattern: '%utctime' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      expect(result).to.eql(date.toISOString());
    });

    it('%yyyy', function() {
      var layout = createLayout({ pattern: '%yyyy' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      expect(result).to.eql(date.getFullYear());
    });

    it('%level', function() {
      var layout = createLayout({ pattern: '%level' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      expect(result).to.eql('debug');
    });

    it('%msg', function() {
      var layout = createLayout({ pattern: '%msg' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      expect(result).to.eql('test test test');
    });

    it('%line', function() {
      var layout = createLayout({ pattern: '%line' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var s = result.split(':');
      expect(s).to.have.length(2);
      expect(path.extname(s[0])).to.be.eql('.js');
      expect(s[0].indexOf('/')).to.be(-1);
    });

    it('%path', function() {
      var layout = createLayout({ pattern: '%path' }, {
        levels: globalConfig.levels,
        colors: globalConfig.colors,
        basedir: path.dirname(process.argv[1])
      });
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var s = result.split(':');
      expect(s).to.have.length(2);
      expect(path.extname(s[0])).to.be.eql('.js');
      expect(s[0].indexOf('/')).to.not.be(-1);
      // mochaの実行パスを起点した相対パスのため "../lib/runnable.js" になるはず
      // /path/to/mocha
      //   |- bin        <- ここがbasedir
      //   |   |- mocha  <- process.argv[1]
      //   |- lib
      //       |- runnable.js
      expect(s[0]).to.be.eql('../lib/runnable.js');
    });

    it('%pid', function() {
      var layout = createLayout({ pattern: '%pid' }, globalConfig);
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      expect(result).to.be(String(process.pid));
    });
  });

});
