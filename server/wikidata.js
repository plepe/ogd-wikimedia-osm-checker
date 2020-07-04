const fetch = require('node-fetch')
const async = require('async')

const httpRequest = require('../src/httpRequest.js')

function loadById(id, callback) {
  fetch('https://www.wikidata.org/wiki/Special:EntityData/' + id + '.json')
    .then(res => res.json())
    .then(json => {
      callback(null, json.entities[id])
    })
}

module.exports = function (options, callback) {
  if (!options.key || !options.key.match(/^(id|P[0-9]+)$/)) {
    return callback(new Error('illegal key'))
  }

  if (!options.id) {
    return callback(new Error('illegal id'))
  }

  if (options.key === 'id') {
    return loadById(options.id,
      (err, result) => {
        if (err) { return callback(err) }
        callback(null, [result])
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
      if (err) { return callback(err) }

      async.map(result.body.results.bindings,
        (entry, done) => {
          const wikidataId = entry.item.value.match(/(Q[0-9]+)$/)[1]
          loadById(wikidataId, done)
        },
        callback
      )
    }
  )
}
