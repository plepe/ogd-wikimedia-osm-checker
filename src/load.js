const iconv = require('iconv-lite')
const csvtojson = require('csvtojson')

const loadFile = require('./loadFile')

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
  loadFile('data/' + dataset.file.name,
    (err, buffer) => {
      const encoded = iconv.decode(buffer, dataset.file.encoding || 'utf-8')

      csvtojson(dataset.file.formatOptions || {})
        .fromString(encoded)
        .subscribe(line => data.push(line))
        .on('done', () => callback(null, data))
    }
  )
}

function loadJSON (dataset, callback) {
  loadFile('data/' + dataset.file.name,
    (err, buffer) => {
      const encoded = iconv.decode(buffer, dataset.file.encoding || 'utf-8')
      let data = JSON.parse(encoded)
      data = convertData(dataset, data)
      callback(null, data)
    }
  )
}

function convertData (dataset, data) {
  if (dataset.file.format === 'geojson') {
    dataset.refData.coordField = {
      id: '_geometry',
      type: 'geojson'
    }

    data = data.features.map(item => {
      const d = item.properties
      d._geometry = item.geometry
      return d
    })
  }

  return data
}
