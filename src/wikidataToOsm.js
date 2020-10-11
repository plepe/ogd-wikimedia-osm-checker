const async = require('async')

const wikidataToOsm = require('./wikidataToOsm.json')

module.exports = {
  init (callback) {
    async.eachOf(wikidataToOsm, (d, property, done) => {
      if (d.file) {
        fetch('data/' + d.file)
          .then(res => res.json())
          .then(json => {
            d.mapping = json
            done()
          })
      } else {
        done()
      }
    },
    callback)
  }
}
