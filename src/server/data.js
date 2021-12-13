const async = require('async')
const yaml = require('yaml')

const Dataset = require('../Dataset')
const load = require('../load')

module.exports = function (options, callback) {
  Dataset.get(options.dataset,
    (err, dataset) => {
      load(dataset, (err, data) => {
        if (err) { return callback(err) }

        if ('id' in options) {
          if (dataset.refData.idField) {
            const filtered = data.filter(item => '' + item[dataset.refData.idField] === options.id)
            callback(null, filtered[0])
          } else {
            callback(null, data[options.id])
          }
        } else {
          callback(null, data)
        }
      })
    }
  )
}
