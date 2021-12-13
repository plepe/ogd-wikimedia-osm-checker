const async = require('async')
const yaml = require('yaml')

const Dataset = require('../Dataset')

module.exports = function (options, callback) {
  Dataset.get(options.dataset,
    (err, dataset) => {
      if (options.id) {
        dataset.getItem(options.id, callback)
      } else {
        dataset.getItems(options, callback)
      }
    }
  )
}
