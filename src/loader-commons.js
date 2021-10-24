const async = require('async')

module.exports = {
  load (queries, options, callback) {
    async.concat(queries,
      (query, done) => {
        const k = Object.keys(query)
        global.fetch('commons.cgi?' + k + '=' + encodeURIComponent(query[k]))
          .then(res => res.json())
          .then(body => {
            done(null, body)
          })
          .catch(e => done(e))
      },
      (err, result) => {
        async.setImmediate(() => callback(err, result))
      }
    )
  },

  includes (arr, el) {
    return !!arr.filter(e => e.title === el.title).length
  }
}
