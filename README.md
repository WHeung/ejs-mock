[![NPM version][npm-image]][npm-url]
# ejs Mock
本地数据模拟服务，使用ejs来解析数据模版
local data mock server, use ejs render response data template

[npm-url]: https://www.npmjs.com/package/ejs-mock
[npm-image]: https://img.shields.io/npm/v/ejs-mock.svg

## Installation and usage
```
$ npm install ejs-mock --save-dev
```
You should then setup a configuration file:
```
$ ./node_modules/.bin/ejs-mock --init
```
After that, you can run ejs-mock
```
$ ./node_modules/.bin/ejs-mock
```
open dashboard 🎛 `http://localhost:8080/ejs-mock-admin`
## Configuration
After running 
```
$ ./node_modules/.bin/ejs-mock --init
```
you'll have a `.ejsmockrc` file in your directory. In it, you'll see some rules configured like this:
```json
{
  "name": "app name",
  "port" : "8080",
  "mockPath": "./mock",
  "rootPath": "./dist"
}
```
## Create an mock
在 `./mock` 文件夹中添加json接口配置文件 `list.json`, like this
```json
{
  "name": "list",
  "describe": "a list",
  "url": "/list",
  "method": "GET",
  "dataType": "JSON",
  "responseKey": "firstKey",
  "responseOptions": {
    "firstKey": {
      "desc": "only one",
      "path": "./list/firstData.json"
    },
    "secondKey": {
      "desc": "multiple items",
      "path": "./list/secondData.json"
    }
  }
}
```
对应 `list.json` 配置，在 `./mock/list` 中创建接口数据文件 `firstData.json`, like this
```
{
  "data": [{
    "text": "hello world"
  }],
  "state": {
    "code": 200,
    "msg": "success"
  }
}
```
After running 
```
$ ./node_modules/.bin/ejs-mock
```
🎈visit admin `http://localhost:8080/ejs-mock/admin`
also running 
```
$ ./node_modules/.bin/ejs-mock demo
```
visit example `http://localhost:8080/`

## Feature：
* 常规数据返回
* 图片上传
* 异常数据返回
* 数据切换