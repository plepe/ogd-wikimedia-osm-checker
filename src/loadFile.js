// browserify will use src/loadFile-browser.js instead
const fs = require('fs')

module.exports = function (filename, callback) {
  fs.readFile(filename, callback)
}
