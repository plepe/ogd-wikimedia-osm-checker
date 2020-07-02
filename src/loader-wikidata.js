const async = require('async')

module.exports = function loadWikidata (queries, callback) {
  async.map(queries,
    (query, done) => {
      global.fetch('wikidata.cgi?id=' + query)
        .then(res => res.json())
        .then(result => done(null, result[0]))
        .catch(e => done(e))
    },
    (err, results) => {
      async.setImmediate(() => callback(err, results))
    }
  )
}
