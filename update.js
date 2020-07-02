const iconv = require('iconv-lite')
const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')

const BdaIDs = [
  ['W', '3354'],
  ['Stmk.', '4967'],
  ['Bgld.', '2099'],
  ['Ktn.', '2878'],
  ['NOE', '10616'],
  ['OOE', '5912'],
  ['Sbg.', '2198'],
  ['Tir.', '4858'],
  ['Vbg.', '1637']
]

function downloadBda (callback) {
  const data = []

  async.each(BdaIDs,
    (ids, done) => {
      const url = 'https://bda.gv.at/fileadmin/Dokumente/bda.gv.at/Publikationen/Denkmalverzeichnis/Oesterreich_CSV/_' + ids[0] + '_2020raw_ID_' + ids[1] + 'POS.csv'

      fetch(url, {})
        .then(response => {
          const converter = iconv.decodeStream('iso-8859-1')
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
  let data = []

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
