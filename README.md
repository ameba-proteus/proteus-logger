proteus-logger
==============================

# Languages

* [English](#english)
* [日本語](#日本語)

# English

## About

Proteus Logger is a logging framework to support application logging.

This module collaborate with [Proteus Cluster](https://github.com/ameba-proteus/proteus-cluster)  to support logging under the clustered environment (under the clustered environment, workers sends log data to the master, and master unify the log management).

Proteus Logger also provides date-time based file rotation, which Winston does not provides.


## Usage

### Initialize Logger

To initialize logger, call configure() or define logger info using Proteus Configurator by setting configure key as "logger".

#### Call configure()

```js
var proteusLogger = require('proteus-logger');
proteusLogger.configure({
  appenders: {
    console: { type: 'console' }
  }
  loggers: {
    logger1: {
      level: 'info',
      appenders: ['console']
    }
  }
});
```

#### Use Proteus Configurator

```js
{
  "appenders": {
    "console": { "type": "console" }
  },
  "loggers": {
    "category2": {
      "level": "info",
      "appenders": ["console"]
    }
  }
}
```

### Log messages

```js
var logger = require('proteus-logger').get('category1');
logger.info('this is the information log');
logger.warn('this is the warning log');
logger.error('this is the error log', err);
```

### Layout configuration

```js
require('proteus-logger').configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        pattern: '%yyyy-%MM-%dd %HH:%mm:%ss %loggerc %msg %argsc (%linec)%nstack'
      }
    }
  }
});
```

##### defined patterns

<table>
<thead>
<tr>
  <th>meta characters</th>
  <th>comments</th>
</tr>
</thead>
<tbody>
<tr>
  <td>yyyy</td>
  <td>Year (4 digits)</td>
</tr>
<tr>
  <td>MM</td>
  <td>Month</td>
</tr>
<tr>
  <td>dd</td>
  <td>Date</td>
</tr>
<tr>
  <td>HH</td>
  <td>Hour (2 digits)</td>
</tr>
<tr>
  <td>mm</td>
  <td>Minute (2 digits)</td>
</tr>
<tr>
  <td>ss</td>
  <td>Seconds (2 digits)</td>
</tr>
<tr>
  <td>T</td>
  <td>Just 'T' to split date and time.</td>
</tr>
<tr>
  <td>level</td>
  <td>Logged level</td>
</tr>
<tr>
  <td>levelc</td>
  <td>Logged level (colored)</td>
</tr>
<tr>
  <td>logger</td>
  <td>Logger name</td>
</tr>
<tr>
  <td>loggerc</td>
  <td>Logger name (colored)</td>
</tr>
<tr>
  <td>msg</td>
  <td>Logging message</td>
</tr>
<tr>
  <td>error</td>
  <td>Error mesage</td>
</tr>
<tr>
  <td>stack</td>
  <td>Stack trace of the error without line break.</td>
</tr>
<tr>
  <td>nstack</td>
  <td>Stack trace of the error with line break before trace.</td>
</tr>
<tr>
  <td>line</td>
  <td>File name and line number</td>
</tr>
<tr>
  <td>linec</td>
  <td>File name and line number (colored)</td>
</tr>
</tr>
<tr>
  <td>n</td>
  <td>Line break</td>
</tr>
</tbody>
</table>

### date-time based file rotation

```js
proteusLogger.configure({
  "appenders": {
    "file": {
      "type": "dailyRotateFile",
      "filename": "dailyRotateFile.log",
      "datePattern": "yyyy-MM-dd"
    }
  },
  "loggers": {
    "category": {
      "level": "info",
      "appenders": ["file"]
    }
  }
});
```

According to the above settings, file will be created as "dailyRotateFile.log.yyyy-MM-dd" and rotated every day.
You can use the following meta characters in datePattern.

<table>
<thead>
<tr>
  <th>meta characters</th>
  <th>comments</th>
</tr>
</thead>
<tbody>
<tr>
  <td>yy</td>
  <td>Year (2 digits)</td>
</tr>
<tr>
  <td>yyyy</td>
  <td>Year (4 digits)</td>
</tr>
<tr>
  <td>M</td>
  <td>Month</td>
</tr>
<tr>
  <td>MM</td>
  <td>Month (2 digits)</td>
</tr>
<tr>
  <td>d</td>
  <td>Dat</td>
</tr>
<tr>
  <td>dd</td>
  <td>Day (2 digits)</td>
</tr>
<tr>
  <td>H</td>
  <td>Hour</td>
</tr>
<tr>
  <td>HH</td>
  <td>Hour (2 digits)</td>
</tr>
<tr>
  <td>m</td>
  <td>Minute</td>
</tr>
<tr>
  <td>mm</td>
  <td>Minute (2 digits)</td>
</tr>
</tbody>
</table>



# 日本語

## 説明

Proteus Logger は、アプリケーションのログ出力をサポートするためのロギングフレームワークです。

[Proteus Cluster](https://github.com/ameba-proteus/proteus-cluster) と連携し、node.js の cluster 環境におけるログ出力をサポートします（Cluster 利用時、worker は master にログ情報を受け渡し、master 側で一元的にログが出力されます）。

Proteus Logger は日付ベースのログローテーションに対応しています。

## 利用方法

### ロガーの初期化

Proteus Logger は、 configure() を呼び出すか、Proteus Configurator に設定される "logger" をキーとした情報を読み込んで各種ロガーを初期化します。

#### configure() を利用

```js
var proteusLogger = require('proteus-logger');
proteusLogger.configure({
  appenders: {
    console: { type: 'console' }
  }
  loggers: {
    logger1: {
      level: 'info',
      appenders: ['console']
    }
  }
});
```

#### Proteus Configuratorを利用

```js
var proteusLogger = require('proteus-logger');
proteusLogger.configure({
  appenders: {
    console: { type: 'console' }
  }
  loggers: {
    logger1: {
      level: 'info',
      appenders: ['console']
    }
  }
});
```

### Loggerの取得

```js
var logger = require('proteus-logger').get('category1');
logger.info('this is the information log');
logger.warn('this is the warning log');
logger.error('this is the error log', err);
```

### レイアウトパターンの利用

```js
require('proteus-logger').configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        pattern: '%yyyy-%MM-%dd %HH:%mm:%ss %loggerc %msg %argsc (%linec)%nstack'
      }
    }
  }
});
```

##### レイアウトで利用可能なパターン文字列

<table>
<thead>
<tr>
  <th>meta characters</th>
  <th>comments</th>
</tr>
</thead>
<tbody>
<tr>
  <td>yyyy</td>
  <td>Year (4 digits)</td>
</tr>
<tr>
  <td>MM</td>
  <td>Month</td>
</tr>
<tr>
  <td>dd</td>
  <td>Date</td>
</tr>
<tr>
  <td>HH</td>
  <td>Hour (2 digits)</td>
</tr>
<tr>
  <td>mm</td>
  <td>Minute (2 digits)</td>
</tr>
<tr>
  <td>ss</td>
  <td>Seconds (2 digits)</td>
</tr>
<tr>
  <td>T</td>
  <td>Just 'T' to split date and time.</td>
</tr>
<tr>
  <td>level</td>
  <td>Logged level</td>
</tr>
<tr>
  <td>levelc</td>
  <td>Logged level (colored)</td>
</tr>
<tr>
  <td>logger</td>
  <td>Logger name</td>
</tr>
<tr>
  <td>loggerc</td>
  <td>Logger name (colored)</td>
</tr>
<tr>
  <td>msg</td>
  <td>Logging message</td>
</tr>
<tr>
  <td>error</td>
  <td>Error mesage</td>
</tr>
<tr>
  <td>stack</td>
  <td>Stack trace of the error without line break.</td>
</tr>
<tr>
  <td>nstack</td>
  <td>Stack trace of the error with line break before trace.</td>
</tr>
<tr>
  <td>line</td>
  <td>File name and line number</td>
</tr>
<tr>
  <td>linec</td>
  <td>File name and line number (colored)</td>
</tr>
</tr>
<tr>
  <td>n</td>
  <td>Line break</td>
</tr>
</tbody>
</table>

### 日時ベースのファイルローテート

```js
proteusLogger.configure({
  "appenders": {
    "file": {
      "type": "dailyRotateFile",
      "filename": "dailyRotateFile.log",
      "datePattern": "yyyy-MM-dd"
    }
  },
  "loggers": {
    "category": {
      "level": "info",
      "appenders": ["file"]
    }
  }
});
```

上記設定の場合、"dailyRotateFile.log.yyyy-MM-dd" というファイルが出力され、日付ごとにファイルが切り替えられます。
datePatternとして、以下のメタ文字を利用することが出来ます。

<table>
<thead>
<tr>
  <th>メタ文字</th>
  <th>説明</th>
</tr>
</thead>
<tbody>
<tr>
  <td>yy</td>
  <td>年（下2桁）</td>
</tr>
<tr>
  <td>yyyy</td>
  <td>年（4桁）</td>
</tr>
<tr>
  <td>M</td>
  <td>月</td>
</tr>
<tr>
  <td>MM</td>
  <td>月（必ず2桁）</td>
</tr>
<tr>
  <td>d</td>
  <td>日</td>
</tr>
<tr>
  <td>dd</td>
  <td>日（必ず2桁）</td>
</tr>
<tr>
  <td>H</td>
  <td>時</td>
</tr>
<tr>
  <td>HH</td>
  <td>時（必ず2桁）</td>
</tr>
<tr>
  <td>m</td>
  <td>分</td>
</tr>
<tr>
  <td>mm</td>
  <td>分（必ず2桁）</td>
</tr>
</tbody>
</table>



# License

Copyright 2012 CyberAgent, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

