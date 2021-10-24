const httpRequest = require('./httpRequest.js')

module.exports = {
  load (queries, options, callback) {
    const body = '[out:json];(' + queries.join('') + ');out tags bb;'

    httpRequest('https://overpass-api.de/api/interpreter',
      {
        method: 'POST',
        responseType: 'json',
        body
      },
      (err, result) => {
        if (err) { return callback(err) }
        callback(null, result.body.elements)
      }
    )
  },

  includes (arr, el) {
    return !!arr.filter(e => e.type === el.type && e.id === el.id).length
  }
}
