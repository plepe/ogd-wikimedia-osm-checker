const fs = require('fs')

const path = 'log'

fs.mkdir(path, (err) => {
  if (err && err.code !== 'EEXIST') {
    console.error("Can't create log directory", err.toString())
  }
})

module.exports = function (options, callback) {
  fs.appendFile(path + '/access.log', new Date().toISOString() + ' ' + options.path + '\n', callback)
}
