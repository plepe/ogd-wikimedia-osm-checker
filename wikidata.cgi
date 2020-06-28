#!/usr/bin/env node
const queryString = require('query-string')
const fetch = require('node-fetch')

console.log('Content-Type: appliation/json; charset=utf8')
console.log('')

let options = queryString.parse(process.env.QUERY_STRING)

if (options.id) {
  fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    body: 'SELECT ?item ?itemLabel ?image ?coords WHERE { ?item wdt:P2951 "' + options.id + '". OPTIONAL {?item wdt:P18 ?image.} OPTIONAL {?item wdt:P625 ?coords.} SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
    headers: {
      'User-Agent': 'osm-wikidata-bda',
      'Accept': 'application/json',
      'Content-Type': 'application/sparql-query'
    }
  })
    .then(res => res.json())
    .then(json => {
      console.log(JSON.stringify(json, null, '  '))
    })
}
