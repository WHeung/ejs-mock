var express = require('express')
var bodyParser = require('body-parser');
var _ = require('lodash')
var path2Regexp = require('path-to-regexp')
var fs = require('fs')
var path = require('path')
var url = require('url')
var CMPlugins = require('./plugins/')
var initAdmin = require('./admin/server.js')
var mockFile = require('./lib/mockFile.js')

function getParams (route, pathname) {
  var params = {}
  var keys = []
  var reg = path2Regexp(route, keys)
  var m = pathname.match(reg)
  if (keys.length > 0) {
    for (var i = 1; i < m.length; ++i) {
      var key = keys[i - 1]
      var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
      if (key) params[key.name] = val
    }
  }
  return params
}

function matchMocks (allMocks, path) {
  var mocks = allMocks.filter(function (config) {
    var reg = path2Regexp(config.url)
    return reg.test(path)
  })
  if (mocks.length > 0) {
    return mocks
  } else {
    return null
  }
}

function requestHandler (req, res, config) {
  var urlParts = url.parse(req.url, true)
  var allMocks = mockFile.getAllMocks(config.mockPath)
  var mocks = matchMocks(allMocks, urlParts.pathname)
  if (mocks) {
    var mock = Object.assign({}, mocks[0])
    var option = mockFile.getOption(config, mock)
    if (_.isNumber(option.statusCode) && option.statusCode !== 200) {
      res.status(option.statusCode)
      res.send(option.statusCode)
    } else {
      var filePath = path.join(config.mockPath, option.path)
      var mockData = fs.readFileSync(filePath, 'utf8')
      mock.appPath = config.appPath
      mock.query = Object.assign({}, urlParts.query, req.body)
      mock.params = getParams(mock.url, urlParts.pathname)
      CMPlugins.mount(mock, req, mockData, function (result) {
        var json = JSON.parse(result)
        json.__matchMocks = mocks
        res.send(JSON.stringify(json))
      })
    }
  } else {
    res.send('{"code": 0, "errInfo": "no api"}')
  }
}

function initStaticServer (app, config) {
  app.use('/', express.static(config.rootPath))
}

function initAPI (app, config) {
  app.get('*', function (req, res) {
    requestHandler(req, res, config)
  })
  app.post('*', function (req, res) {
    requestHandler(req, res, config)
  })
}

function main (config) {
  var app = express()
  app.use(bodyParser())
  initStaticServer(app, config)
  initAdmin(app, config)
  initAPI(app, config)
  app.listen(config.port || 3000, config.ip || '127.0.0.1')
}

module.exports = main
