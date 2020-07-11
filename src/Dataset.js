const async = require('async')
const natsort = require('natsort').default

class Dataset {
  load (callback) {
    if (this.data) {
      return callback(null)
    }

    const ortFilter = {}
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
              this.data[entry[this.idField]] = entry
              ortFilter[entry[this.ortFilterField]] = true
            })

            done()
          })
          // .catch(e => done(e))
      }
    ],
    err => {
      if (err) { return callback(err) }

      this.ortFilter = Object.keys(ortFilter)
      this.ortFilter = this.ortFilter.sort(natsort({ insensitive: true }))

      callback(null)
    })
  }
}

module.exports = Dataset
