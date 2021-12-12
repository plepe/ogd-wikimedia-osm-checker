const fs = require('fs')
const queryString = require('query-string')

module.exports = function datasetsList (options = {}, callback) {
  if (fs.readFile) {
    fs.readdir('datasets/', { withFileTypes: true }, (err, files) => {
      if (err) { return callback(err) }

      files = files
        .map(file => {
          const m = file.name.match(/^([^.].*)\.yaml$/)
          if (m) {
            return {
              id: m[1]
            }
          }
        })
        .filter(file => file)

      callback(null, files)
    })
  } else {
    let param = ''
    if (Object.keys(options).length) {
      param = '?' + queryString.stringify(options)
    }

    global.fetch('datasets.cgi' + param)
      .then(res => res.json())
      .then(list => callback(null, list))
  }
}
