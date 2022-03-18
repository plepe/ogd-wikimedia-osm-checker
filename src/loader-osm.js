const httpRequest = require('./httpRequest.js')

let active = null
const queue = []
const delay = 2000

function load (queries, options, callback) {
  queue.push([queries, options, callback])

  if (!active) {
    next()
  }
}

function next () {
  if (!queue.length) {
    return
  }

  const [queries, options, callback] = queue.shift()
  active = true

  const body = '[out:json];(' + queries.join('') + ');out tags bb;'

  httpRequest('https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      responseType: 'json',
      body
    },
    (err, result) => {
      global.setTimeout(() => {
        active = false
        next()
      }, delay)

      if (err) { return callback(err) }
      callback(null, result.body.elements)
    }
  )
}

module.exports = {
  load,

  includes (arr, el) {
    return !!arr.filter(e => e.type === el.type && e.id === el.id).length
  }
}
