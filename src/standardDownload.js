const fetch = require('node-fetch')
const fs = require('fs')

module.exports = function standardDownload (dataset, callback) {
  if (!dataset.file) {
    dataset.file = {}
  }
  if (!dataset.file.format) {
    dataset.file.format = 'json'
  }

  if (!dataset.file.name) {
    dataset.file.name = dataset.id + '.' + dataset.file.format
  }

  fetch(dataset.source.url)
    .then(response => {
      const writer = fs.createWriteStream('data/' + dataset.file.name)
      response.body.pipe(writer)

      writer.on('finish', () => {
        if (response.headers.has('last-modified')) {
          const date = new Date(response.headers.get('last-modified'))
          fs.utimes('data/' + dataset.file.name, date, date, callback)
        } else {
          callback(null)
        }
      })
      writer.on('error', err => {
        console.error(dataset.id, err)
      })
    })
}
