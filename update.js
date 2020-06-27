const iconv = require('iconv-lite')
const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')

const httpRequest = require('./src/httpRequest.js')
const wikimedia_commons_sleep = 1000

global.XMLHttpRequest= require('w3c-xmlhttprequest').XMLHttpRequest

const bda_ids = [
  [ 'W', '3354' ],
  [ 'Stmk.', '4967' ],
  [ 'Bgld.', '2099' ],
  [ 'Ktn.', '2878' ],
  [ 'NOE', '10616' ],
  [ 'OOE', '5912' ],
  [ 'Sbg.', '2198' ],
  [ 'Tir.', '4858' ],
  [ 'Vbg.', '1637' ]
]

function download_bda (callback) {
  let data = []

  async.each(bda_ids,
    (ids, done) => {
      let url = 'https://bda.gv.at/fileadmin/Dokumente/bda.gv.at/Publikationen/Denkmalverzeichnis/Oesterreich_CSV/_' + ids[0] + '_2020raw_ID_' + ids[1] + 'POS.csv'

      fetch(url, {})
        .then(response => {

        let converter = iconv.decodeStream('iso-8859-1')
        let stream = response.body.pipe(converter)

        csvtojson({delimiter: ';'})
          .fromStream(stream)
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

function wmc_members (data, cont, callback) {
  console.log('Wikimedia Commons - next')
  // remove cmtype=subcat to also include files
  let url = 'https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&format=json&cmtitle=Category:Cultural_heritage_monuments_in_Austria_with_known_IDs&cmlimit=500&cmtype=subcat' + (cont ? '&cmcontinue=' + cont : '')
  fetch(url)
    .then(res => res.json())
    .catch(err => console.error(err))
    .then(json => {
      let members = json.query.categorymembers
      members.forEach(member => data.push(member))

      if (json.continue) {
        global.setTimeout(() => {
          wmc_members(data, json.continue.cmcontinue, callback)
        }, wikimedia_commons_sleep)
      } else {
        callback()
      }
   })
}

function download_wikimedia_commons (callback, start = 0) {
  let members = []
  let data = []

  wmc_members(members, null, (err) => {
    if (err) { return callback(err) }

    fs.writeFile('data/wikimedia_commons_members.json', JSON.stringify(members, null, '  '), callback)

    async.eachOfLimit(members, 1,
      (entry, i, done) => {
        console.log(i, entry.title)
        fetch('https://commons.wikimedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=' + encodeURIComponent(entry.title))
          .then(res => res.json())
          .then(body => {
            let text = body.parse.wikitext['*']

            let m = text.match(/\{\{\ *(doo|Denkmalgeschütztes Objekt Österreich)\|(1=)?([0-9]+)\ *\}\}/)

            if (m) {
              data.push({
                id: m[3],
                title: entry.title
              })
            }

            global.setTimeout(() => done(), wikimedia_commons_sleep)
          })
      },
      (err) => {
        console.log(data)
        fs.writeFile('data/wikimedia_commons.json', JSON.stringify(data, null, '  '), callback)
      }
    )
  })
}

download_bda((err) => {
  if (err) { console.error(err) }
})

download_wikimedia_commons((err) => {
  if (err) { console.error(err) }
})

download_overpass((err) => {
  if (err) { console.error(err) }
})

download_wikidata((err) => {
  if (err) { console.error(err) }
})
