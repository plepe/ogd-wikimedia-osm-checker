const queryString = require('query-string')
const fetch = require('node-fetch')

const Cache = require('../Cache')
const cache = new Cache()

const queries = {}

module.exports = function (options, callback) {
  const id = JSON.stringify(options)

  const data = cache.get(id)
  if (data !== undefined) {
    return callback(null, data)
  }

  if (id in queries) {
    return queries[id].push(callback)
  }

  queries[id] = [ callback ]

  options.format = 'json'
  url = 'https://nominatim.openstreetmap.org/search?' + queryString.stringify(options)

  fetch(url, {
    headers: {
      'User-Agent': 'ogd-wikimedia-osm-checker'
    }
  })
    .then(res => res.json())
    .then(data => {
      const callbacks = queries[id]
      delete queries[id]

      cache.add(id, data)
      callbacks.forEach(cb => cb(null, data))
    })
}
