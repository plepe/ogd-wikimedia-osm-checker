// browserify will use src/datasetsList-browser.js instead
const async = require('async')
const fs = require('fs')
const yaml = require('yaml')

const loadFile = require('./loadFile')
const fixDatasetConfig = require('./fixDatasetConfig')

module.exports = function datasetsList (options = {}, callback) {
  if (options.id) {
    return loadDatasetFile(options.id, callback)
  }

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

    if (options.withContent) {
      async.map(
        files,
        (file, done) => loadDatasetFile(file.id, done),
        callback
      )
    } else {
      callback(null, files)
    }
  })
}

function loadDatasetFile (id, callback) {
  loadFile('datasets/' + id + '.yaml', (err, body) => {
    if (err) { return callback(err) }

    const c = yaml.parse(body.toString())
    c.id = id

    fixDatasetConfig(c)

    callback(null, c)
  })
}
