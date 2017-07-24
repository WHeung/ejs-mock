var ejs = require('ejs')
var _ = require('lodash')
var global = {
  number: function (len) {
    if (!_.isNumber(len)) {
      len = 10
    }
    if (len === 1) {
      return _.random(1, 9)
    }
    return _.random(Math.pow(10, len - 1), Math.pow(10, len) - 1)
  },
  id: function () {
    return _.uniqueId('id_')
  },
  _: _
}

function main (option, mockData, env, callback) {
  global = Object.assign(global, { $params: env.mock.params })
  var result = ejs.render(mockData, global)
  callback(result)
}

module.exports = main
