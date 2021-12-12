const fs = require('fs')

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
    global.fetch('datasets/')
      .then(res => res.json())
      .then(list => callback(null, list))
  }
}
