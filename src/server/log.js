const fs = require('fs')

const path = 'log'

fs.mkdir(path, (err) => {
  if (err && err.code !== 'EEXIST') {
    console.error("Can't create log directory", err.toString())
  }
})

module.exports = function (options, callback) {
  if (options.last) {
    fs.readFile(path + '/access.log', (err, result) => {
      if (err) { return callback(err) }

      result = result
        .toString()
        .trimEnd()
        .split(/\n/g)
        .slice(-options.last)
        .map(e => {
          e = e.split(/ /)
          return { ts: e[0], path: e[1] }
        })

      callback(null, result)
    })
  }
  else {
    fs.appendFile(path + '/access.log', new Date().toISOString() + ' ' + options.path + '\n', callback)
  }
}
