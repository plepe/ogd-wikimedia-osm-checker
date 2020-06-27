const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')

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

download_bda((err) => {
  if (err) { console.error(err) }
})
