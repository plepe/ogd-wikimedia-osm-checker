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

        global.fetch('wikipedia.cgi?list=' + encodeURIComponent(query.list) + '&id=' + encodeURIComponent(query.id) + (options.reload ? '&reload=true' : ''))
          .then(res => res.json())
          .then(body => {
            if (body.length) {
              const data = body[0].raw
              data.url = body[0].url

              cache.add(query, [data])

              done(null, [data])
            } else {
              done(null, [])
            }
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
