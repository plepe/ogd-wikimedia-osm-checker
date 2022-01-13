const async = require('async')
const yaml = require('yaml')

const Dataset = require('../Dataset')
const load = require('../load')

module.exports = function (options, callback) {
  Dataset.get(options.dataset,
    (err, dataset) => {
      load(dataset, (err, data, stat) => {
        if (err) { return callback(err) }

        const header = {}
        if (stat) {
          header['Last-Modified'] = new Date(stat.mtime).toUTCString()
          header['X-Download-Date'] = new Date(stat.ctime).toUTCString()
        }

        if ('id' in options) {
          if (dataset.refData.idField) {
            const filtered = data.filter(item => '' + item[dataset.refData.idField] === options.id)
            callback(null, filtered[0], header)
          } else {
            callback(null, data[options.id], header)
          }
        } else {
          callback(null, data, header)
        }
      })
    }
  )
}
