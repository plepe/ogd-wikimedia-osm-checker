const OverpassFrontend = require('overpass-frontend')
const httpRequest = require('./httpRequest.js')

const overpassFrontend = new OverpassFrontend('https://overpass-api.de/api/interpreter')

function load (queries, options, callback) {
  const result = []
  overpassFrontend.BBoxQuery(
    '(' + queries.join('') + ');',
    null,
    {
      properties: OverpassFrontend.TAGS | OverpassFrontend.GEOM
    },
    (err, feature) => {
      result.push(feature)
    },
    (err) => {
      if (err) { return callback(err) }
      callback(null, result)
    }
  )
}

module.exports = {
  load,

  includes (arr, el) {
    return !!arr.filter(e => e.type === el.type && e.id === el.id).length
  }
}
