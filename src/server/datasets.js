const async = require('async')
const yaml = require('yaml')

const datasetsList = require('../datasetsList')
const loadFile = require('../loadFile')

module.exports = function (options, callback) {
  datasetsList(options,
    (err, list) => {
      if (err) { return callback(err) }

      if (options.withContent) {
        async.map(files, (d, done) => {
          loadFile('datasets/' + d.id + '.yaml', (err, body) => {
            if (err) { return done(err) }

            const c = yaml.parse(body.toString())
            c.id = d.id
            done(null, c)
          })
        }, callback)
      } else {
        return callback(null, list)
      }
    }
  )
}
