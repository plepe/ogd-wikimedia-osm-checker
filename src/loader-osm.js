const httpRequest = require('./httpRequest.js')
const OverpassFrontend = require('overpass-frontend')
const async = {
  each: require('async/each')
}

const overpassFrontend = new OverpassFrontend('https://overpass-api.de/api/interpreter')

module.exports = {
  load (queries, options, callback) {
    const result = []

    async.each(
      queries,
      (query, done) => {
        overpassFrontend.BBoxQuery(
          query.query,
          query.bounds,
          {
            properties: OverpassFrontend.TAGS | OverpassFrontend.GEOM
          },
          (err, el) => {
            if (err) { return done(err) }

            result.push(el)
          },
          (err) => {
            if (err) { return done(err) }
            done()
          }
        )
      },
      (err) => {
        callback(err, result)
      }
    )
  },

  includes (arr, el) {
    return !!arr.filter(e => e.type === el.type && e.id === el.id).length
  }
}
