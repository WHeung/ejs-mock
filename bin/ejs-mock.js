#!/usr/bin/env node

"use strict";

var program = require('commander')
var fs = require('fs')
var path = require('path')

program
  .version('0.0.15')

program
  .command('start')
  .option('-p, --port <port>', 'set server port')
  .action(function (options) {
    if (!fs.existsSync('.ejsmockrc')) {
      console.log('init ejs-mock config')
      var configPath = path.join(process.cwd(), '.ejsmockrc')
      var config = {
        'name': 'app name',
        'port': '8080',
        'mockPath': './mock',
        'rootPath': './dist'
      }
      fs.writeFileSync('.ejsmockrc', JSON.stringify(config, null, 4), function (err) {
        if (err) throw err
        console.log('create ejs-mock config file: .ejsmockrc')
      })
    }

    var config = JSON.parse(fs.readFileSync('./.ejsmockrc', 'utf8'))
    var EjsMock = require(path.join(__dirname, '../'))
    config.appPath = path.join(process.cwd())
    config.userSettingPath = path.join(config.appPath, 'ejsmocksettings.json')
    config.rootPath = path.join(config.appPath, config.rootPath)
    config.mockPath = path.join(config.appPath, config.mockPath)

    EjsMock(config)
    console.log(`start ejs-mock server http://localhost:${config.port}`)
    console.log(`visit ejs-mock admin http://localhost:${config.port}/ejs-mock/admin`)
  })

program
  .command('demo')
  .action(function () {
    var configPath = path.join(__dirname, '../example/.ejsmockrc')
    var modulePath = path.join(__dirname, '../')
    var text = fs.readFileSync(configPath, 'utf8')
    var config = JSON.parse(text)
    var EjsMock = require(modulePath)

    config.appPath = path.join(__dirname, '../example/')
    config.userSettingPath = path.join(config.appPath, 'ejsmocksettings.json')
    config.rootPath = path.join(config.appPath, config.rootPath)
    config.mockPath = path.join(config.appPath, config.mockPath)

    EjsMock(config)
    console.log('start ejs-mock server http://localhost:8080')
    console.log('visit ejs-mock admin http://localhost:8080/ejs-mock/admin')
  })

program.parse(process.argv)
