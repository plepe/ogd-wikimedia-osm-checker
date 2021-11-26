const iconv = require('iconv-lite')
const fetch = require('node-fetch')
const csvtojson = require('csvtojson')
const fs = require('fs')

module.exports = function standardDownload (dataset, callback) {
  switch (dataset.source.format) {
    case 'csv':
      downloadCSV(dataset, callback)
      break
    case 'json':
    default:
      downloadJSON(dataset, callback)
  }
}

function downloadCSV (dataset, callback) {
  const data = []

  fetch(dataset.source.url)
    .then(response => {
      const converter = iconv.decodeStream(dataset.source.encoding || 'utf-8')
      const stream = response.body.pipe(converter)

      csvtojson(dataset.source.formatOptions || {})
        .fromStream(stream)
        .subscribe(line => {
          data.push(line)
        })
        .on('done', () => {
          fs.writeFile('data/' + dataset.filename, JSON.stringify(data), callback)
        })
    })
}

function downloadJSON (dataset, callback) {
  const data = []

  fetch(dataset.source.url)
    .then(response => {
      const converter = iconv.decodeStream(dataset.source.encoding || 'utf-8')
      const writer = fs.createWriteStream('data/' + dataset.filename)
      response.body.pipe(converter).pipe(writer)

      converter.on('end', () => {
        callback(null)
      })
      writer.on('error', err => {
        console.error(dataset.id, err)
      })
    })
}

function save (dataset, data, callback) {
}
