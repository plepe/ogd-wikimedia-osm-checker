const async = require('async')
const yaml = require('yaml')

const Dataset = require('../Dataset')

module.exports = function (options, callback) {
  Dataset.get(options.dataset,
    (err, dataset) => {
      if (options.id) {
        dataset.getItem(options.id, (err, data, stat) => reply(err, dataset, data, stat, callback))
      } else if (options.values) {
        dataset.getValues(options.values, (err, data, stat) => reply(err, dataset, data, stat, callback))
      } else if ('info' in options) {
        dataset.getItems(options, (err, data, stat) => reply(err, dataset, {
          count: data.length,
          ctime: stat.ctime,
          mtime: stat.mtime,
          size: stat.size
        }, stat, callback))
      } else {
        dataset.getItems(options, (err, data, stat) => reply(err, dataset, data, stat, callback))
      }
    }
  )
}

function reply (err, dataset, data, stat, callback) {
  if (err) { return callback(err) }

  const header = {}
  if (stat) {
    header['Last-Modified'] = new Date(stat.mtime).toUTCString()
    header['X-Download-Date'] = new Date(stat.ctime).toUTCString()
  }

  callback(null, data, header)
}
