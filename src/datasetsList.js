const async = require('async')
const fs = require('fs')
const yaml = require('yaml')
const queryString = require('query-string')

const loadFile = require('./loadFile')

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
        callback(null, files)
      }
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
