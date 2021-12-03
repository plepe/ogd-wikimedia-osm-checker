const fs = require('fs')
const fetch = require('node-fetch')
const proj4 = require('proj4')

module.exports = function downloadSalzburgApotheken (callback) {
  fetch('https://www.salzburg.gv.at/ogd/3ae40a5c-88ce-4cfe-8fa1-f64d97c47bd4/Apotheken.json')
    .then(response => response.json())
    .then(body => {
      body.features = body.features.map(feature => {
        const coords = proj4('+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=450000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs', 'EPSG:4326', feature.geometry)

        return {
          properties: feature.attributes,
          geometry: {
            type: 'Point',
            coordinates: [
              coords.x,
              coords.y
            ]
          }
        }
      })

      fs.writeFile('data/salzburg-apotheken.geojson', JSON.stringify(body, null, '  '), callback)
    })
}
