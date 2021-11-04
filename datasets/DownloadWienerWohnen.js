const fs = require('fs')
const fetch = require('node-fetch')

module.exports = function downloadWienerWohnen (callback) {
  const data = []

  fetch('https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.json')
    .then(response => response.json())
    .then(body => {
      const data = body.aaData.map(entry => {
        const m1 = entry[1].match(/^<a href='(\/hof\/([0-9]+)\/.*)'>(.*)<\/a>$/)
        const m2 = entry[2].match(/^(1[0-9][0-9].)? ([^,]*), (.*)$/)
        const m3 = entry[3].match(/^([0-9]{4})-([0-9]{4})$/)
        const m5 = entry[5].match(/^(?:Architekt: ([^<]*)<br\/>)?(Kunst am Bau<br\/>)?(?:Wohnungen: ([0-9]+)<br\/>)?(?:Lokale: ([0-9]+))?/)

        if (!m1) {
          console.log(entry[1])
          return
        }

        const result = {
          id: m1[2],
          image: entry[0].match(/^<img src='([^']*)'/)[1],
          url: 'https://www.wienerwohnen.at' + m1[1],
          name: m1[3],
          plz: m2[1] ? m2[1] : 'other',
          ort: m2[2],
          address: m2[3],
          constructionStartYear: m3 ? m3[1] : entry[3],
          constructionEndYear: m3 ? m3[2] : entry[3],
          pdf: entry[4].match(/^<a href='([^']*)'/)[1],
          publicArt: !!m5[2]
        }

        if (m5[1]) {
          result.architects = m5[1]
        }

        if (m5[3]) {
          result.flats = parseInt(m5[3])
        }

        if (m5[4]) {
          result.commercialSpaces = parseInt(m5[4])
        }

        return result
      })

      fs.writeFile('data/wiener_wohnen.json', JSON.stringify(data, null, '  '), callback)
    })
}
