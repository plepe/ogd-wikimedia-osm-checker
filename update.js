const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')

const httpRequest = require('./src/httpRequest.js')

global.XMLHttpRequest= require('w3c-xmlhttprequest').XMLHttpRequest

const bda_ids = [
  [ 'W', '3354' ],
  [ 'Stmk.', '4967' ]
]

function download_bda (callback) {
  let data = []

  async.each(bda_ids,
    (ids, done) => {
      let url = 'https://bda.gv.at/fileadmin/Dokumente/bda.gv.at/Publikationen/Denkmalverzeichnis/Oesterreich_CSV/_' + ids[0] + '_2020raw_ID_' + ids[1] + 'POS.csv'

      httpRequest(url, {}, (err, result) => {
        if (err) { return done(err) }

        csvtojson({delimiter: ';'})
          .fromString(result.body)
          .subscribe(line => {
            data.push(line)
          })
          .on('done', done)
      })
    },
    (err) => {
      if (err) { return callback(err) }

      fs.writeFile('data/bda.json', JSON.stringify(data, null, '  '), callback)
    }
  )
}

function download_overpass (callback) {
  httpRequest('https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      responseType: 'json',
      body: '[out:json];nwr["ref:at:bda"];out tags;'
    },
    (err, result) => {
      if (err) { return callback(err) }

      fs.writeFile('data/overpass.json', JSON.stringify(result.body.elements, null, '  '), callback)
    }
  )
}

function download_wikidata (callback) {
  fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    body: 'SELECT ?item ?itemLabel ?ID WHERE { ?item wdt:P2951 ?ID SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
    headers: {
      'User-Agent': 'osm-wikidata-bda',
      'Accept': 'application/json',
      'Content-Type': 'application/sparql-query'
    }
  })
    .then(res => res.json())
    .then(json => {
      fs.writeFile('data/wikidata.json', JSON.stringify(json, null, '  '), callback)
    })
}

download_bda((err) => {
  if (err) { console.error(err) }
})

download_overpass((err) => {
  if (err) { console.error(err) }
})

download_wikidata((err) => {
  if (err) { console.error(err) }
})
