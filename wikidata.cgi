#!/usr/bin/env node
const queryString = require('query-string')
const fetch = require('node-fetch')
const async = require('async')

console.log('Content-Type: appliation/json; charset=utf8')
console.log('')

let options = queryString.parse(process.env.QUERY_STRING)

if (options.id) {
  fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    body: 'SELECT ?item ?itemLabel WHERE { ?item wdt:P2951 "' + options.id + '". SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
    headers: {
      'User-Agent': 'osm-wikidata-bda',
      'Accept': 'application/json',
      'Content-Type': 'application/sparql-query'
    }
  })
    .then(res => res.json())
    .then(json => {
      async.map(json.results.bindings,
        (entry, done) => {
          let wikidataId = entry.item.value.match(/(Q[0-9]+)$/)[1]
          fetch('https://www.wikidata.org/wiki/Special:EntityData/' + wikidataId + '.json')
            .then(res => res.json())
            .then(json => {
              done(null, json.entities[wikidataId])
            })
        },
        (err, result) => {
          console.log(JSON.stringify(result, null, '  '))
        }
      )

    })
}
