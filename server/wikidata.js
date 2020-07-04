const fetch = require('node-fetch')
const async = require('async')

const httpRequest = require('../src/httpRequest.js')

const active = []
const pending = []
const maxActive = 1
let interval

function loadById(id, callback) {
  fetch('https://www.wikidata.org/wiki/Special:EntityData/' + id + '.json')
    .then(res => res.json())
    .then(json => {
      callback(null, json.entities[id])
    })
}

function next (options) {
  //console.log('done', JSON.stringify(options))
  active.splice(active.indexOf(options), 1)
}

function _next () {
  if (!pending.length) {
    global.clearInterval(interval)
    interval = null
    return
  }

  if (active.length >= maxActive) {
    return
  }

  let req = pending.shift()
  active.push(req[0])
  _request(req[0], req[1])
}

function request (options, callback) {
  if (!options.key || !options.key.match(/^(id|P[0-9]+)$/)) {
    return callback(new Error('illegal key'))
  }

  if (!options.id) {
    return callback(new Error('illegal id'))
  }

  pending.push([options, callback])

  if (!interval) {
    interval = global.setInterval(_next, 1000)
  }
}

function _request (options, callback) {
  //console.log('start', JSON.stringify(options))
  if (options.key === 'id') {
    return loadById(options.id,
      (err, result) => {
        if (err) { return callback(err) }
        callback(null, [result])
        next(options)
      }
    )
  }

  let query = 'SELECT ?item ?itemLabel WHERE { ?item wdt:' + options.key + ' "' + options.id.replace(/"/g, '\\"') + '". SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }'
  httpRequest('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query),
    {
      headers: {
        // lower case to avoid forbidden request headers, see:
        // https://github.com/ykzts/node-xmlhttprequest/pull/18/commits/7f73611dc3b0dd15b0869b566f60b64cd7aa3201
        'user-agent': 'bundesdenkmal-checker',
        accept: 'application/json'
      },
      responseType: 'json'
    },
    (err, result) => {
      next(options)
      if (err) { return callback(err) }

      async.map(result.body.results.bindings,
        (entry, done) => {
          const wikidataId = entry.item.value.match(/(Q[0-9]+)$/)[1]
          request(
            {key: 'id', id: wikidataId},
            (err, r) => done(err, r.length ? r[0] : null)
          )
        },
        (err, results) => {
          callback(err, results)
        }
      )
    }
  )
}

module.exports = request
