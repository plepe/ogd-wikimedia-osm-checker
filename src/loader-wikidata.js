const async = require('async')
const queryString = require('query-string')

const Cache = require('./Cache')
const cache = new Cache()

module.exports = {
  load (queries, options, callback) {
    async.map(queries,
      (query, done) => {
        const data = cache.get(query, options)
        if (data !== undefined) {
          return done(null, data)
        }

        global.fetch('wikidata.cgi?' + queryString.stringify(query))
          .then(res => res.json())
          .then(result => {
            cache.add(query, result[0])
            done(null, result[0])
          })
          .catch(e => done(e))
      },
      (err, results) => {
        results = results.filter(r => !!r)
        async.setImmediate(() => callback(err, results))
      }
    )
  },

  cached (query) {
    return cache.get(query)
  },

  includes (arr, el) {
    return !!arr.filter(e => e.id === el.id).length
  }
}
