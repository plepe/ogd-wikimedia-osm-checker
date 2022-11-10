const async = require('async')

const datasetsList = require('../datasetsList')

module.exports = function (options, callback) {
  datasetsList(options,
    (err, list) => {
      if (err) { return callback(err) }

      return callback(null, list)
    }
  )
}

