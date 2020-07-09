const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const bezirke = {
  1010: 'Innere Stadt',
  1020: 'Leopoldstadt',
  1030: 'Landstraße',
  1040: 'Wieden',
  1050: 'Margareten',
  1060: 'Mariahilf',
  1070: 'Neubau',
  1080: 'Josefstadt',
  1090: 'Alsergrund',
  1100: 'Favoriten',
  1110: 'Simmering',
  1120: 'Meidling',
  1130: 'Hietzing',
  1140: 'Penzing',
  1150: 'Rudolfsheim-Fünfhaus',
  1160: 'Ottakring',
  1170: 'Hernals',
  1180: 'Währing',
  1190: 'Döbling',
  1200: 'Brigittenau',
  1210: 'Floridsdorf',
  1220: 'Donaustadt',
  1230: 'Liesing'
}

const typ2OverpassQuery = {
  'Gedenktafeln': 'nwr[memorial=plaque](filter);',
  'Denkmäler': 'nwr[historic=memorial](filter);',
  'Sakrale Kleindenkmäler': null,
  'Brunnen': 'nwr[amenity=fountain](filter);',
  'Profanplastiken/Kunst am Bau freistehend': 'nwr[tourism=artwork](filter);',
  'Kunst am Bau wandgebunden': 'nwr[tourism=artwork](filter);',
  'Grabmäler/Grabhaine': null,
  '': null
}

const checks = [
  require('../checks/commonsTemplateToWikidata.js')('/\\{\\{[Pp]ublic Art Austria\\s*\\|\\s*(1=)*$1\\|\\s*(2=)*AT-9\\}\\}/'),
  require('../checks/wikidataLoaded.js')(),
  require('../checks/wikidataCoords.js')(),
  require('../checks/wikidataIsA.js')(),
  require('../checks/wikidataRecommendations.js')(),
  require('../checks/commonsImage.js')(),
  require('../checks/commonsWikidataInfobox.js')(),
  require('../checks/wikipediaKunstwerkliste.js')({
    template: 'WLPA-AT-Zeile',
    idField: 'ID',
    showFields: ['Name', 'Name-Vulgo', 'Typ', 'Beschreibung', 'Standort', 'Künstler']
  }),
  require('../checks/osmLoadFromWikidata.js')(),
  require('../checks/osmLoadSimilar.js')(),
  require('../checks/osmTags.js')()
]

class DatasetKunstWien extends Dataset {
  id = 'kunstwien'

  title = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  listTitle = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  filename = 'kunstwien.json'

  idField = 'ID'

  ortFilterField = 'PLZ'

  checks = checks

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    tr.appendChild(td)

    const a = document.createElement('a')
    a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.OBJEKTTITEL) + '</span><span class="Adresse">' + escHTML(entry.STRASSE) + '</span>'
    a.href = '#' + this.id + '/' + entry.ID
    td.appendChild(a)
    td.appendChild(document.createElement('br'))

    dom.appendChild(tr)
  }

  showEntry (data, dom) {
    const div = document.createElement('div')
    dom.appendChild(div)

    div.innerHTML = '<h2>Stadt Wien</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + data.ID + '</li>'
    ul.innerHTML += '<li>Titel: ' + escHTML(data.OBJEKTTITEL) + '</li>'
    ul.innerHTML += '<li>Vulgonamen: ' + escHTML(data.VULGONAMEN) + '</li>'
    ul.innerHTML += '<li>Typ: ' + escHTML(data.TYP) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.STRASSE) + ', ' + escHTML(data.PLZ) + ' ' + escHTML(data.ORT) + '</li>'
    let coords = data.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    if (coords) {
      ul.innerHTML += '<li>Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + coords[2] + '&mlon=' + coords[1] + '#map=19/' + coords[2] + '/' + coords[1] + '">' + parseFloat(coords[2]).toFixed(5) + ', ' + parseFloat(coords[1]).toFixed(5) + '</a></li>'
    }
    ul.innerHTML += '<li>Standort: ' + escHTML(data.STANDORT) + '</li>'
    ul.innerHTML += '<li>Beschreibung: ' + escHTML(data.BESCHREIBUNG) + '</li>'
    ul.innerHTML += '<li>Geschichte: ' + escHTML(data.GESCHICHTE) + '</li>'
    ul.innerHTML += '<li>Entstehung: ' + escHTML(data.ENTSTEHUNG) + ' (' + escHTML(data.EPOCHE) + ')</li>'
    ul.innerHTML += '<li>Künstler*in: ' + escHTML(data.KUENSTLER) + '</li>'
    ul.innerHTML += '<li>Material: ' + escHTML(data.MATERIAL) + '</li>'

    //const pre = document.createElement('pre')
    //dom.appendChild(pre)
    //pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }

  wikipediaListeTitle (ob) {
    return 'Liste der ' +
      (['Gedenktafeln', 'Gedenksteine'].includes(ob.refData.TYP) ? 'Gedenktafeln und Gedenksteine' : 'Kunstwerke im öffentlichen Raum') +
      ' in Wien/' + bezirke[ob.refData.PLZ]
  }

  compileOverpassQuery (ob, filter) {
    return typ2OverpassQuery[ob.refData.TYP]
  }
}

module.exports = new DatasetKunstWien()
