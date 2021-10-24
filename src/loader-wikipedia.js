const async = require('async')

module.exports = {
  load (queries, options, callback) {
    async.concat(queries,
      (query, done) => {
        global.fetch('wikipedia.cgi?list=' + encodeURIComponent(query.list) + '&id=' + encodeURIComponent(query.id) + (options.reload ? '&reload=true' : ''))
          .then(res => res.json())
          .then(body => {
            if (body.length) {
              let data = body[0].raw
              data.url = body[0].url
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

  includes (arr, el) {
    return !!arr.filter(e => e.title === el.title).length
  }
}
