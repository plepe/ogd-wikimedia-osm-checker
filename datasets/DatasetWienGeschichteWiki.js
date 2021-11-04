const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const bezirke = {
  01: 'Innere Stadt',
  02: 'Leopoldstadt',
  03: 'Landstraße',
  04: 'Wieden',
  05: 'Margareten',
  06: 'Mariahilf',
  07: 'Neubau',
  08: 'Josefstadt',
  09: 'Alsergrund',
  10: 'Favoriten',
  11: 'Simmering',
  12: 'Meidling',
  13: 'Hietzing',
  14: 'Penzing',
  15: 'Rudolfsheim-Fünfhaus',
  16: 'Ottakring',
  17: 'Hernals',
  18: 'Währing',
  19: 'Döbling',
  20: 'Brigittenau',
  21: 'Floridsdorf',
  22: 'Donaustadt',
  23: 'Liesing'
}

const typ2OverpassQuery = {
  "Grünfläche": 265,
  "Sonstiges": null,
  "Friedhof": 69,
  "Gewässer": 91,
  "Grätzel": 93,
  "Berg": 47,
  "Markt": 26,
  "Siedlung": 39,
  "Ort": 41,
  "Vorstadt": 38,
  "Bezirk": 25,
  "Denkmal": "(nwr[historic=memorial](filter);nwr[historic=monument](filter););",
  "Sakralbau": 506,
  "Brücke": 142,
  "Verkehrsfläche": "way[highway](filter);",
  "Behörde": 43,
  "Verein": 159,
  "Institution": 270,
  "Anstalt": 98,
  "Firma": 93,
  "Konfessionelle Verwaltungseinheit": 5,
  "Politische Partei": 3,
  "Gericht": 1,
  "organisationen": 1323,
  "bauwerke": 129,
  "Park": "nwr[leisure=park](filter);",
  "topografische_objekte": 19,
  "Fonds": 1,
  "Anschlag": 1,
  "Sportveranstaltung": 2,
  "Feier": 1,
  "Demonstration/Streik": 1,
  "Naturereignis": 1,
  "Wettbewerb": 1,
  "Brand": 1,
  "Unruhe": 1,
  "Skandal": 1,
  "Verfassungsänderung": 1,
  "Gebäude": "nwr[building](filter);",
  "Passagen": 2,
  "Katastralgemeinde": 87,
  "Zielgebiet Stadtentwicklung": 2,
  "Herrschaft": 5,
  "Wald": 3,
  "Vorort": 2
}

const checks = [
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P7842', 'Wien Geschichte Wiki ID']),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckOsmLoadSimilar.js')({
    coordField: {
      type: 'shape',
      id: 'SHAPE'
    },
    nameField: 'SEITENNAME'
  }),
  require('../checks/CheckOsmLoadFromWikidata.js')()
]

class DatasetKunstWien extends Dataset {
  id = 'wien-geschichte-wiki'

  title = 'Wien Geschichte Wiki'

  titleLong = 'Wien Geschichte Wiki'

  listTitle = 'Wien Geschichte Wiki'

  ogdURL = 'https://www.geschichtewiki.wien.gv.at/Wien_Geschichte_Wiki'

  ogdInfo = 'https://www.data.gv.at/katalog/dataset/wien-geschichte-wiki'

  filename = 'wien-geschichte-wiki.json'

  idField = 'PAGEID'

  osmRefField = null

  ortFilterField = 'BEZIRK'

  checks = checks

  listEntry (entry) {
    return {
      id: entry.PAGEID,
      text: '<span class="Bezeichnung">' + escHTML(entry.SEITENNAME) + '</span><span class="Adresse">' + escHTML(this.entryType(entry)) + ' | ' + escHTML(entry.ADRESSE) + '</span>'
    }
  }

  entryType (entry) {
    return entry.ART_DES_OBJEKTS || entry.ART_DES_EREIGNISSES || entry.ART_DES_BAUWERKS || entry.ART_DER_ORGANISATION || entry.KATEGORIE_TXT
  }

  showEntry (data, dom) {
    const div = document.createElement('div')
    dom.appendChild(div)

    div.innerHTML = '<h2>Wien Geschichte Wiki</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + data.PAGEID + '</li>'
    ul.innerHTML += '<li>Titel: ' + escHTML(data.SEITENNAME) + '</li>'
    ul.innerHTML += '<li>Vulgonamen: ' + escHTML(data.FRUEHERE_BEZEICHNUNG) + '</li>'
    ul.innerHTML += '<li>Typ: ' + escHTML(this.entryType(data)) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.ADRESSE) + '</li>'
    let coords = data.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    if (coords) {
      ul.innerHTML += '<li>Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + coords[2] + '&mlon=' + coords[1] + '#map=19/' + coords[2] + '/' + coords[1] + '">' + parseFloat(coords[2]).toFixed(5) + ', ' + parseFloat(coords[1]).toFixed(5) + '</a></li>'
    }
    ul.innerHTML += '<li>Bennant nach: ' + escHTML(data.BENANNT_NACH) + '</li>'
    ul.innerHTML += '<li>Bennant seit: ' + escHTML(data.NAME_SEIT) + '</li>'
    ul.innerHTML += '<li>URL: <a target="_blank" href="https://www.geschichtewiki.wien.gv.at/?curid=' + escHTML(data.PAGEID) + '">Link</a></li>'

    //const pre = document.createElement('pre')
    //dom.appendChild(pre)
    //pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }

  recommendedTags (ob) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  compileOverpassQuery (ob, filter) {
    let r = typ2OverpassQuery[this.entryType(ob.refData)]
    console.log(r)
    return r
  }
}

module.exports = new DatasetKunstWien()
