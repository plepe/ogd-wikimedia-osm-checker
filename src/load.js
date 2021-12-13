const iconv = require('iconv-lite')
const csvtojson = require('csvtojson')

const loadFile = require('./loadFile')

module.exports = function load (dataset, callback) {
  if (!dataset.file) {
    dataset.file = {}
  }
  if (!dataset.file.format) {
    dataset.file.format = 'json'
  }

  if (!dataset.file.name) {
    dataset.file.name = dataset.id + '.' + dataset.file.format
  }

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
