const fs = require('fs')
const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM
const async = require('async')

function lon2tile (lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))) }
function lat2tile (lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))) }

module.exports = function downloadOpenplaques (callback) {
  const bbox = [ 48.1304, 16.2677, 48.2932, 16.4984 ]
  const tiles = [ lat2tile(bbox[2], 14), lon2tile(bbox[1], 14), lat2tile(bbox[0], 14), lon2tile(bbox[3], 14) ]

  const urls = []
  for (let y = tiles[0]; y <= tiles[2]; y++) {
    for (let x = tiles[1]; x <= tiles[3]; x++) {
      urls.push('https://openplaques.org/places/at/areas/vienna/plaques/tiles/14/' + x + '/' + y + '.geojson')
    }
  }

  let result = []

  async.each(urls,
    (url, done) => {
      console.log(url)
      fetch(url)
        .then(res => res.json())
        .then(body => {
          result = result.concat(
            body.features.map(feature => {
              feature.properties.coordinate = feature.geometry.coordinates
              return feature.properties
            })
          )

          done()
        })
    },
    (err) => {
      if (err) {
        return callback(err)
      }

      fs.writeFile('data/openplaques.json', JSON.stringify(result, null, '  '), callback)
    }
  )
}
