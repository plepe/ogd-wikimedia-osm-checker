const async = require('async')

module.exports = function loaderCommons (queries, callback) {
  async.map(queries,
    (value, done) => {
      global.fetch('commons.cgi?title=' + encodeURIComponent('Category:' + value))
        .then(res => res.json())
        .then(body => {
          done(null, body.length ? body[0] : null)
        })
        .catch(e => done(e))
    },
    (err, result) => {
      async.setImmediate(() => callback(err, result))
    }
  )
}
