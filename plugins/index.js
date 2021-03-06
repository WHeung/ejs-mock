var _ = require('lodash')
var singleUpload = require('./upload')
var customData = require('./custom')
var allPlugins = {
  'singleUpload': singleUpload,
  'default': customData
}

function mount (mock, req, mockData, callback) {
  var plugins = mock.plugin
  if (_.isObject(plugins)) {
    plugins = [plugins]
  }
  if (!_.isArray(plugins)) {
    plugins = []
  }
  plugins.unshift({
    name: 'default'
  })
  var env = {
    mock: mock,
    req: req
  }
  loadPlugin(plugins, mockData, env, function (result) {
    callback(result)
  })
}

function loadPlugin (plugins, mockData, env, callback) {
  var plugin = plugins.pop()
  allPlugins[plugin.name](plugin.option, mockData, env, function (result) {
    if (plugins.length > 0) {
      loadPlugin(plugins, result, env, callback)
    } else {
      callback(result)
    }
  })
}

module.exports = {
  mount: mount
}
