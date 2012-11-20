proteus-logger
==============================

Proteus Logger は、アプリケーションのログ出力をサポートするための
ロギングフレームワークです。
Proteus Cluster モジュールと連動し、node.js の cluster 環境におけるログ出力を
サポートします。
現行バージョンでは、ログのコアライブラリに Winston を採用しています。

# Usage

Logger は、 Proteus Configurator に設定される logger をキーとした情報を読み込んで各種ロガーを初期化します。
Cluster 利用時は、worker は master にログ情報を受け渡し、master 側で一元的にログ出力されます。

### Loggerの取得

```js
var logger = require('proteus-logger').logger('example');
logger.info('this is the information log');
logger.warn('this is the warning log');
logger.error('this is the error log');
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

