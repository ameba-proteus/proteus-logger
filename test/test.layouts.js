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
        basedir: path.basename(__dirname)
      });
      var date = new Date();
      var result = layout.call(this, 0, date, 'test test test', []);
      expect(result).to.be.ok();
      var s = result.split(':');
      expect(s).to.have.length(2);
      expect(path.extname(s[0])).to.be.eql('.js');
      expect(s[0].indexOf('/')).to.not.be(-1);
      // 'test/'を起点とした相対パスのため "../node_modules/..." になるはず
      expect(s[0].slice(0, 16)).to.be.eql('../node_modules/');
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
