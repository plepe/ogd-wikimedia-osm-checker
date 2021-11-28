const iconv = require('iconv-lite')
const csvtojson = require('csvtojson')

module.exports = function load (dataset, callback) {
  switch (dataset.file.format) {
    case 'csv':
      loadCSV(dataset, callback)
      break
    case 'geojson':
    case 'json':
    default:
      loadJSON(dataset, callback)
  }
}

function loadCSV (dataset, callback) {
  const data = []
  const chunks = []

  fetch('data/' + dataset.file.name)
    .then(response => response.arrayBuffer())
    .then(buffer => iconv.decode(new Buffer(buffer), dataset.file.encoding || 'utf-8'))
    .then(encoded =>
      csvtojson(dataset.file.formatOptions || {})
        .fromString(encoded)
        .subscribe(line => data.push(line))
        .on('done', () => callback(null, data))
    )
}

function loadJSON (dataset, callback) {
  fetch('data/' + dataset.file.name)
    .then(response => response.arrayBuffer())
    .then(buffer => iconv.decode(new Buffer(buffer), dataset.file.encoding || 'utf-8'))
    .then(encoded => {
      const data = JSON.parse(encoded)
      callback(null, data)
    })
}
