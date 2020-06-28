#!/usr/bin/env node
const queryString = require('query-string')
const fetch = require('node-fetch')

console.log('Content-Type: appliation/json; charset=utf8')
console.log('')

let options = queryString.parse(process.env.QUERY_STRING)

if (options.id) {
  fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    body: 'SELECT ?item ?itemLabel (GROUP_CONCAT(?image; SEPARATOR="|") AS ?images) ?coords ?commonsCat WHERE { ?item wdt:P2951 "' + options.id + '". OPTIONAL {?item wdt:P18 ?image.} OPTIONAL {?item wdt:P625 ?coords.} OPTIONAL {?item wdt:P373 ?commonsCat.} SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } } GROUP BY ?item ?itemLabel ?coords ?commonsCat',
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
