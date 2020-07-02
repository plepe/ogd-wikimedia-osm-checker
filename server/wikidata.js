const fetch = require('node-fetch')
const async = require('async')

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

  fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    body: 'SELECT ?item ?itemLabel WHERE { ?item wdt:' + options.key + ' "' + options.id.replace(/"/g, '\\"') + '". SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
    headers: {
      'User-Agent': 'osm-wikidata-bda',
      Accept: 'application/json',
      'Content-Type': 'application/sparql-query'
    }
  })
    .then(res => res.json())
    .then(json => {
      async.map(json.results.bindings,
        (entry, done) => {
          const wikidataId = entry.item.value.match(/(Q[0-9]+)$/)[1]
          loadById(wikidataId, done)
        },
        callback
      )
    })
    .catch(e => callback(e))
}
