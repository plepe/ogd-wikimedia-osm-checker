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

download_bda((err) => {
  if (err) { console.error(err) }
})
