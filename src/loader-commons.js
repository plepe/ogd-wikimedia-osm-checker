const async = require('async')

const Cache = require('./Cache')
const cache = new Cache()

module.exports = {
  load (queries, options, callback) {
    async.concat(queries,
      (query, done) => {
        const data = cache.get(query, options)
        if (data !== undefined) {
          return done(null, data)
        }

        const k = Object.keys(query)
        global.fetch('commons.cgi?' + k + '=' + encodeURIComponent(query[k]))
          .then(res => res.json())
          .then(body => {
            cache.add(query, body)
            done(null, body)
          })
          .catch(e => done(e))
      },
      (err, result) => {
        async.setImmediate(() => callback(err, result))
      }
    )
  },

  cached (query) {
    return cache.get(query)
  },

  includes (arr, el) {
    return !!arr.filter(e => e.title === el.title).length
  }
}
