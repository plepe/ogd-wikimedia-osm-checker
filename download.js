const async = require('async')
const fs = require('fs')
const fetch = require('node-fetch')

const downloads = require('./src/datasets/downloads')

function downloadWikidataLists (callback) {
  async.parallel([
    done => {
      fetch('https://query.wikidata.org/sparql',
        {
          method: 'POST',
          body: 'select ?item ?osmTag ?itemLabel where { ?item wdt:P31 wd:Q32880.  ?item wdt:P1282 ?osmTag.  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
          headers: {
            'Content-Type': 'application/sparql-query',
            'User-Agent': 'ogd-wikimedia-osm-checker',
            Accept: 'application/json'
          }
        }
      )
        .then(res => res.json())
        .then(json => {
          const data = {}
          json.results.bindings.forEach(d => {
            const k = d.item.value.match(/\/(Q[0-9]+)$/)[1]
            const v = d.osmTag.value.match(/^(Key|Tag):building:architecture=(.*)$/)
            if (!(k in data) && v) {
              data[k] = {
                tag: v[2],
                name: d.itemLabel.value
              }
            }
          })

          fs.writeFile('data/building_architecture.json', JSON.stringify(data, null, '  '), done)
        })
    }
  ], callback)
}

async.eachOf(downloads, (fun, id, callback) => {
  console.error('Starting', id)
  fun((err, result) => {
    if (err) {
      console.error('Error downloading', id, err)
    } else {
      console.error('Success downloading', id)
    }
  })
})

downloadWikidataLists(err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
