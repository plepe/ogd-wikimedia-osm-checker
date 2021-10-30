const iconv = require('iconv-lite')
const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM

function downloadBda (callback) {
  fetch('https://bda.gv.at/denkmalverzeichnis/')
    .then(response => response.text())
    .then(result => {
      const dom = new JSDOM(result)
      let list = dom.window.document.querySelectorAll('#download-als-csv li a')
      list = Array.from(list)
      list = list.map(entry => entry.getAttribute('href'))

      downloadBdaFiles(list, callback)
    })
}

function downloadBdaFiles (urls, callback) {
  const data = []

  async.each(urls,
    (url, done) => {
      fetch(url, {})
        .then(response => {
          const converter = iconv.decodeStream('utf-8')
          const stream = response.body.pipe(converter)

          csvtojson({ delimiter: ';' })
            .fromStream(stream)
            .subscribe(line => {
              data.push(line)
            })
            .on('done', done)
        })
        .catch(e => done(e))
    },
    (err) => {
      if (err) { return callback(err.message) }

      fs.writeFile('data/bda.json', JSON.stringify(data, null, '  '), callback)
    }
  )
}

function downloadKunstwerkeWien (callback) {
  const data = []

  fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:KUNSTWERKOGD&srsName=EPSG:4326&outputFormat=csv')
    .then(response => {
      csvtojson({ delimiter: ',' })
        .fromStream(response.body)
        .subscribe(line => {
          data.push(line)
        })
        .on('done', () => {
          fs.writeFile('data/kunstwien.json', JSON.stringify(data, null, '  '), callback)
        })
    })
}

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

downloadBda(err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})

downloadKunstwerkeWien(err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})

downloadWikidataLists(err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
