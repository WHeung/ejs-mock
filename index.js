var express = require('express')
var bodyParser = require('body-parser');
var _ = require('lodash')
var path2Regexp = require('path-to-regexp')
var fs = require('fs')
var path = require('path')
var url = require('url')
var CMPlugins = require('./plugins/')

var getEachAPI = function (dir, fn) {
  fs.readdirSync(dir).forEach(function (file) {
    if (!/.json$/.test(file)) return
    file = dir + '/' + file
    fn(JSON.parse(fs.readFileSync(file, 'utf8')))
  })
}

function matchMocks (allMocks, path) {
  var reg = path2Regexp(path)
  var result = allMocks.filter(function (config) {
    return reg.test(config.url)
  })
  if (result.length > 0) {
    return result
  } else {
    return null
  }
}

function getMockData (config, mock, query) {
  var responseKey = mock.responseKey

  // user setting cover
  if (fs.existsSync(config.userSettingPath)) {
    var setting = fs.readFileSync(config.userSettingPath, 'utf8')
    setting = JSON.parse(setting)
    if (_.isString(setting[mock.name])) {
      responseKey = setting[mock.name]
    }
  }

  var option = mock.responseOptions[responseKey]
  var filePath = path.join(config.mockPath, option.path)
  var mockData = fs.readFileSync(filePath, 'utf8')
  return mockData
}

function getAllMocks (mockPath) {
  var list = []
  getEachAPI(mockPath, function (apiConfig) {
    list.push(apiConfig)
  })
  return list
}

function requestHandler (req, res, config) {
  var urlParts = url.parse(req.url, true)
  var query = urlParts.query
  var allMocks = getAllMocks(config.mockPath)
  var mocks = matchMocks(allMocks, req.url)
  if (mocks) {
    var mock = mocks[0]
    var mockData = getMockData(config, mock, query)
    mock.appPath = config.appPath
    CMPlugins.mount(mock, req, mockData, function (result) {
      var json = JSON.parse(result)
      json.__matchMocks = mocks
      res.send(JSON.stringify(json))
    })
  } else {
    res.send('{"code": 0, "errInfo": "no api"}')
  }
}

function initAdmin (app, config) {
  var adminStaticPath = path.join(__dirname, '/admin')
  app.use('/ejs-mock/admin', express.static(adminStaticPath))
  app.get('/ejs-mock/admin/update_response_key', function (req, res, next) {
    var urlParts = url.parse(req.url, true)
    var mockName = urlParts.query['mockName']
    var responseKey = urlParts.query['responseKey']
    if (_.isString(mockName) && _.isString(responseKey)) {
      updateUserSetting(mockName, responseKey, config)
      res.send('{"code": "200"}')
    } else {
      res.send('{"code": "500", "errInfo": "param error"}')
    }
  })

  app.post('/ejs-mock/admin/update_template', function (req, res, next) {
    var template = req.body.template
    var filePath = req.body.path
    var templateFilePath = path.join(config.mockPath, filePath)
    if (fs.existsSync(templateFilePath)) {
      fs.writeFile(templateFilePath, template, function (err) {
        if (err) {
          res.send('{"code": "500", "errInfo": "wirte file fail"}')
          return 
        }
        res.send('{"code": "200"}')
      })
    } else {
      res.send('{"code": "500", "errInfo": "file no exist"}')
    }
  })

  app.get('/ejs-mock/admin/list', function (req, res, next) {
    var allMocks = getAllMocks(config.mockPath)
    var setting = {}
    if (fs.existsSync(config.userSettingPath)) {
      setting = fs.readFileSync(config.userSettingPath, 'utf8')
      setting = JSON.parse(setting)
    }
    allMocks.forEach(function (mock) {
      var mockName = mock.name
      mock.responseOptionsList = []
      for (var key in mock.responseOptions) {
        var option = mock.responseOptions[key]
        option.key = key
        option.template = fs.readFileSync(path.join(config.mockPath, option.path), 'utf8')
        mock.responseOptionsList.push(option)
      }
      if (setting[mockName]) {
        mock.responseKey = setting[mockName]
      }
    })
    var data = {
      code: 1,
      data: allMocks
    }
    res.send(data)
  })
}

function updateUserSetting (mockName, responseKey, config) {
  if (fs.existsSync(config.userSettingPath)) {
    fs.readFile(config.userSettingPath, 'utf8', function (err, data) {
      if (err) return console.log(err.stack)
      var setting = JSON.parse(data)
      setting[mockName] = responseKey
      setting = JSON.stringify(setting, null, 4)
      fs.writeFile(config.userSettingPath, setting, function (err) {
        if (err) console.log(err)
      })
    })
  } else {
    var setting = {}
    setting[mockName] = responseKey
    setting = JSON.stringify(setting, null, 4)
    fs.writeFile(config.userSettingPath, setting, function (err) {
      if (err) console.log(err)
    })
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
  app.listen(config.port || 3000, '127.0.0.1')
}

module.exports = main
