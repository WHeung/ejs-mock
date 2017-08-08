var path = require('path')
var express = require('express')
var mockFile = require('../lib/mockFile.js')
var fs = require('fs')

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
    var allMocks = mockFile.getAllMocks(config.mockPath)
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
        if (option.path) {
          option.template = fs.readFileSync(path.join(config.mockPath, option.path), 'utf8')
        } else {
          if (option.statusCode) {
            option.template = option.statusCode + ''
          } else {
            option.template = 'ejsmock error: not found path and not found statusCode'
          }
        }
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

module.exports = initAdmin