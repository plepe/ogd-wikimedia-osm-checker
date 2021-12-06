const fs = require('fs')

module.exports = function (filename, callback) {
  if (fs.readFile) {
    fs.readFile(filename, callback)
  }
  else {
    global.fetch(filename)
      .then(response => response.arrayBuffer())
      .then(buffer => callback(null, Buffer.from(buffer)))
  }
}
