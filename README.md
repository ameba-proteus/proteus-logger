proteus-logger
==============================

## About

Proteus Logger is a logging framework to support application logging.

This module collaborate with [Proteus Cluster](https://github.com/ameba-proteus/proteus-cluster)  to support logging under the clustered environment (under the clustered environment, workers sends log data to the master, and master unify the log management).

Proteus Logger also provides date-time based file rotation in cluster environment.


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
  <td>sss</td>
  <td>Milliseconds (3 digits)</td>
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
<tr>
  <td>path</td>
  <td>Relative path and line number</td>
</tr>
<tr>
  <td>pathc</td>
  <td>Relative path and line number (colored)</td>
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
  appenders: {
    file: {
      type: "dailyRotateFile",
      filename: "rotated.log", // file to be appended
      pattern: "rotated.%yyyy-%MM-%dd.log" // file to be replaced
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

According to the above settings, file will be created as "rotated.log" and rotated daily. Rotated files will be something like "rotated.2014-03-12.log". You can use the following meta characters in pattern.

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
  <td>Month (2 digits)</td>
</tr>
<tr>
  <td>dd</td>
  <td>Day (2 digits)</td>
</tr>
<tr>
  <td>hh</td>
  <td>Hours (2 digits)</td>
</tr>
<tr>
  <td>mm</td>
  <td>Minutes (2 digits)</td>
</tr>
</tbody>
</table>

Since pattern has hours and minutes, rotation interval can be modified in configuration. You can set interval property in milliseconds.

```js
proteusLogger.configure({
  appenders: {
    file: {
      type: "dailyRotateFile",
      filename: "rotated.log", // file to be appended
      pattern: "rotated.%yyyy-%MM-%dd-%hh.log" // file to be replaced,
      interval: 3600000 // 1 hour interval
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

