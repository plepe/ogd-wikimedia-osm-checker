const fetch = require('node-fetch')
const csvtojson = require('csvtojson')
const fs = require('fs')

module.exports = function downloadKunstwerkeWien (callback) {
  const data = []

  fetch('https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:KUNSTWERKOGD&srsName=EPSG:4326&outputFormat=csv')
    .then(response => {
      csvtojson({ delimiter: ',' })
        .fromStream(response.body)
        .subscribe(line => {
          data.push(line)
        })
        .on('done', () => {
          fs.writeFile('data/kunstwien.json', JSON.stringify(data, null, '  '), callback)
        })
    })
}
