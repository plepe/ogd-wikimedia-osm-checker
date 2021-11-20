const fs = require('fs')

module.exports = function (options, callback) {
  fs.appendFile('log/access.log', new Date().toISOString() + ' ' + options.path + '\n', callback)
}
