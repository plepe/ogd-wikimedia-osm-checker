const iconv = require('iconv-lite')
const fs = require('fs')
const fetch = require('node-fetch')
const stream = require('stream')

// this inserts
class FixIDStream extends stream.Transform {
  _transform (chunk, encoding, callback) {
    let data = chunk.toString()
    data = data.replace(/\r\n/g, '\r\n0')

    callback(null, data)
  }
}
const fixIDStream = new FixIDStream()

module.exports = function downloadDenkmallisteBerlin (callback) {
  fetch('https://www.berlin.de/landesdenkmalamt/_assets/pdf-und-zip/denkmale/liste-karte-datenbank/denkmalliste_berlin.csv')
    .then(response => {
      const converter = iconv.decodeStream('iso-8859-1')
      const writer = fs.createWriteStream('data/denkmalliste-berlin.csv')
      const stream = response.body.pipe(converter).pipe(fixIDStream).pipe(writer)

      writer.on('finish', () => {
        callback(null)
      })
      writer.on('error', err => {
        console.error(dataset.id, err)
      })
    })
}
