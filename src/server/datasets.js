const async = require('async')
const yaml = require('yaml')

const datasetsList = require('../datasetsList')
const loadFile = require('../loadFile')

module.exports = function (options, callback) {
  if (options.id) {
    return loadDatasetFile(options.id, callback)
  }

  datasetsList(options,
    (err, list) => {
      if (err) { return callback(err) }

      if (options.withContent) {
        async.map(
          list,
          (d, done) => loadDatasetFile(d.id, done),
          callback
        )
      } else {
        return callback(null, list)
      }
    }
  )
}

function loadDatasetFile (id, callback) {
  loadFile('datasets/' + id + '.yaml', (err, body) => {
    if (err) { return callback(err) }

    const c = yaml.parse(body.toString())
    c.id = id

    callback(null, c)
  })
}
