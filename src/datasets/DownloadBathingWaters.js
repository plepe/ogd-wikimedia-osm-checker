const iconv = require('iconv-lite')
const fs = require('fs')
const fetch = require('node-fetch')
const stream = require('stream')


module.exports = function downloadBathingWaters (callback) {
  fetch('https://www.eea.europa.eu/data-and-maps/data/bathing-water-directive-status-of-bathing-water-13/bathing-water-directive-status/excel-format-zip/at_download/file')
    .then(response => {
      const writer = fs.createWriteStream('data/bathing-waters.zip')
      const stream = response.body.pipe(writer)

      writer.on('finish', () => {
        nextStep(callback)
      })
      writer.on('error', err => {
        console.error(dataset.id, err)
      })
    })
}
