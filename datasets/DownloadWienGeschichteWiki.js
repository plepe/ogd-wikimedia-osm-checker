const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')

module.exports = function downloadWienGeschichteWiki (callback) {
  const data = []

  fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:KULTURWIKIOGD%20&srsName=EPSG:4326&outputFormat=csv')
    .then(response => {
      csvtojson({ delimiter: ',' })
        .fromStream(response.body)
        .subscribe(line => {
          data.push(line)
        })
        .on('done', () => {
          fs.writeFile('data/wien-geschichte-wiki.json', JSON.stringify(data, null, '  '), callback)
        })
    })
}
