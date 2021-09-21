const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const typ2OverpassQuery = {
  Gedenktafeln: 'nwr[historic=memorial](filter);',
  Denkmäler: 'nwr[historic=memorial](filter);',
  'Sakrale Kleindenkmäler': 'nwr[historic~"^wayside_(cross|shrine)$"](filter);',
  Brunnen: 'nwr[amenity=fountain](filter);',
  'Profanplastiken/Kunst am Bau freistehend': '(nwr[tourism=artwork](filter);nwr[amenity=fountain](filter););',
  'Kunst am Bau wandgebunden': 'nwr[tourism=artwork](filter);',
  'Grabmäler/Grabhaine': '(nwr[amenity=graveyard](filter);nwr[cemetery=grave](filter);nwr[historic=tomb](filter););',
  '': null
}

const checks = [
  require('../checks/CheckCommonsLoadFromTemplate.js')('/\\{\\{[Pp]ublic Art Austria\\s*\\|\\s*(1=)*$1\\|\\s*(2=)*AT-9\\}\\}/'),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P8430', 'Wien Kulturgut: Kunstwerke im öffentlichen Raum ID']),
  require('../checks/CheckWikidataLoadFromCommons.js')(),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckCommonsTemplate.js')(),
  require('../checks/CheckWikipediaListe.js')({
    template: '(WLPA-AT-Zeile|Gedenktafel Österreich Tabellenzeile)',
    idField: 'ID',
    wikidataField: 'WD-Item',
    showFields: ['Name', 'Name-Vulgo', 'Typ', 'Beschreibung', 'Standort', 'Künstler']
  }),
  require('../checks/CheckOsmLoadSimilar.js')({
    nameField: 'OBJEKTTITEL'
  }),
  require('../checks/CheckOsmLoadFromRefOrWikidata.js')()
]

class DatasetKunstWien extends Dataset {
  id = 'kunstwien'

  title = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  listTitle = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  ogdURL = 'https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'

  ogdInfo = 'Katalog Kunstwerke im öffentlichen Raum Standorte Wien'

  filename = 'kunstwien.json'

  idField = 'ID'

  osmRefField = 'ref:wien:kultur'

  coordField = {
    type: 'shape',
    id: 'SHAPE'
  }

  wikipediaListeSearchTitle = '/Liste der (Gedenktafeln und Gedenksteine|Kunstwerke im öffentlichen Raum) in Wien/'

  ortFilterField = 'PLZ'

  commonsTemplateRegexp = 'Public Art Austria'

  commonsTemplate = '{{Public Art Austria|$1|AT-9}}'

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
    const coords = data.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    if (coords) {
      ul.innerHTML += '<li>Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + coords[2] + '&mlon=' + coords[1] + '#map=19/' + coords[2] + '/' + coords[1] + '">' + parseFloat(coords[2]).toFixed(5) + ', ' + parseFloat(coords[1]).toFixed(5) + '</a></li>'
    }
    ul.innerHTML += '<li>Standort: ' + escHTML(data.STANDORT) + '</li>'
    ul.innerHTML += '<li>Beschreibung: ' + escHTML(data.BESCHREIBUNG) + '</li>'
    ul.innerHTML += '<li>Geschichte: ' + escHTML(data.GESCHICHTE) + '</li>'
    ul.innerHTML += '<li>Entstehung: ' + escHTML(data.ENTSTEHUNG) + ' (' + escHTML(data.EPOCHE) + ')</li>'
    ul.innerHTML += '<li>Künstler*in: ' + escHTML(data.KUENSTLER) + '</li>'
    ul.innerHTML += '<li>Material: ' + escHTML(data.MATERIAL) + '</li>'

    // const pre = document.createElement('pre')
    // dom.appendChild(pre)
    // pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }

  wikipediaListeAnchor (ob) {
    return 'id-' + ob.id
  }

  recommendedTags (ob) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  missingTags (ob) {
    const result = []

    result.push('ref:wien:kultur=' + ob.id)
    if (ob.data.wikidata.length) {
      result.push('wikidata=' + ob.data.wikidata[0].id)
    }

    return result
  }

  compileOverpassQuery (ob, filter) {
    return typ2OverpassQuery[ob.refData.TYP]
  }
}

module.exports = new DatasetKunstWien()
