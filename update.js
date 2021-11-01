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

function downloadWienerWohnen (callback) {
  const data = []

  fetch('https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.json')
    .then(response => response.json())
    .then(body => {
      const data = body.aaData.map(entry => {
        const m1 = entry[1].match(/^<a href='(\/hof\/([0-9]+)\/.*)'>(.*)<\/a>$/)
        const m2 = entry[2].match(/^(1[0-9][0-9].)? ([^,]*), (.*)$/)
        const m3 = entry[3].match(/^([0-9]{4})-([0-9]{4})$/)
        const m5 = entry[5].match(/^(?:Architekt: ([^<]*)<br\/>)?(Kunst am Bau<br\/>)?(?:Wohnungen: ([0-9]+)<br\/>)?(?:Lokale: ([0-9]+))?/)

        if (!m1) {
          console.log(entry[1])
          return
        }

        const result = {
          id: m1[2],
          image: entry[0].match(/^<img src='([^']*)'/)[1],
          url: 'https://www.wienerwohnen.at' + m1[1],
          name: m1[3],
          plz: m2[1] ? m2[1] : 'other',
          ort: m2[2],
          address: m2[3],
          constructionStartYear: m3 ? m3[1] : entry[3],
          constructionEndYear: m3 ? m3[2] : entry[3],
          pdf: entry[4].match(/^<a href='([^']*)'/)[1],
          publicArt: !!m5[2]
        }

        if (m5[1]) {
          result.architects = m5[1]
        }

        if (m5[3]) {
          result.flats = parseInt(m5[3])
        }

        if (m5[4]) {
          result.commercialSpaces = parseInt(m5[4])
        }

        return result
      })

      fs.writeFile('data/wiener_wohnen.json', JSON.stringify(data, null, '  '), callback)
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

downloadWienerWohnen (err => {
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
