const httpRequest = require('./httpRequest.js')

module.exports = function loaderOSM (queries, callback) {
  const query = queries.join('') + 'out tags;'

  httpRequest('https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      responseType: 'json',
      body: '[out:json];' + query
    },
    (err, result) => {
      if (err) { return callback(err) }
      callback(null, result.body.elements)
    }
  )
}
