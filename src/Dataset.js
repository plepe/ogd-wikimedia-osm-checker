const async = require('async')
const natsort = require('natsort').default

class Dataset {
  load (callback) {
    if (this.data) {
      return callback(null)
    }

    const placeFilter = {}
    this.data = {}

    async.parallel([
      done => {
        global.fetch('data/' + this.filename)
          .then(res => {
            if (!res.ok) {
              throw Error('loading BDA data: ' + res.statusText)
            }

            return res.json()
          })
          .then(json => {
            json.forEach(entry => {
              this.data[entry[this.refData.idField]] = entry
              placeFilter[entry[this.refData.placeFilterField]] = true
            })

            done()
          })
          // .catch(e => done(e))
      }
    ],
    err => {
      if (err) { return callback(err) }

      this.placeFilter = Object.keys(placeFilter)
      this.placeFilter = this.placeFilter.sort(natsort({ insensitive: true }))

      callback(null)
    })
  }
}

module.exports = Dataset
