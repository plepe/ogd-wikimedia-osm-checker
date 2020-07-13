const async = require('async')

module.exports = {
  load (queries, callback) {
    async.map(queries,
      (query, done) => {
        global.fetch('wikidata.cgi?key=' + query.key + '&id=' + query.id)
          .then(res => res.json())
          .then(result => done(null, result[0]))
          .catch(e => done(e))
      },
      (err, results) => {
        results = results.filter(r => !!r)
        async.setImmediate(() => callback(err, results))
      }
    )
  },

  includes (arr, el) {
    return !arr.filter(e => e.id === el.id)
  }

}
