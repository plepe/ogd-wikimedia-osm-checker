const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const checks = [
  require('../checks/commonsTemplateToWikidata.js')('/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/'),
  require('../checks/osmRefBda.js')('ref:at:bda'),
  require('../checks/wikidataLoadViaRef.js')('P2951'),
  require('../checks/wikidataLoaded.js')(),
  require('../checks/wikidataCoords.js')(),
  require('../checks/wikidataIsA.js')(),
  require('../checks/wikidataRecommendations.js')(),
  require('../checks/commonsLoad.js')(),
  require('../checks/wikidataImage.js')(),
  require('../checks/commonsWikidataInfobox.js')(),
  require('../checks/wikipediaListe.js')({
    template: 'Denkmalliste Österreich Tabellenzeile',
    idField: 'ObjektID',
    showFields: ['Name', 'Beschreibung', 'Anmerkung']
  }),
  require('../checks/commonsTemplate.js')(),
  require('../checks/osmLoadSimilar.js')({
    coordField: null,
    nameField: 'Bezeichnung'
  })
]

class DatasetBDA extends Dataset {
  id = 'bda'

  title = 'Bundesdenkmalamt'

  listTitle = 'Denkmal aus Bundesdenkmalamtsliste'

  filename = 'bda.json'

  idField = 'ObjektID'

  osmRefField = 'ref:at:bda'

  wikipediaListeSearchTitle = 'Liste der denkmalgeschützten Objekte in'

  ortFilterField = 'Gemeinde'

  checks = checks

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    tr.appendChild(td)

    const a = document.createElement('a')
    a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.Bezeichnung) + '</span><span class="Adresse">' + escHTML(entry.Adresse) + '</span>'
    a.href = '#' + this.id + '/' + entry.ObjektID
    td.appendChild(a)
    td.appendChild(document.createElement('br'))

    dom.appendChild(tr)
  }

  showEntry (data, dom) {
    const div = document.createElement('div')
    dom.appendChild(div)

    div.innerHTML = '<h2>Bundesdenkmalamt</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + data.ObjektID + '</li>'
    ul.innerHTML += '<li>Bezeichnung: ' + escHTML(data.Bezeichnung) + '</li>'
    ul.innerHTML += '<li>Gemeinde: ' + escHTML(data.Gemeinde) + '</li>'
    ul.innerHTML += '<li>Kat.gemeinde: ' + escHTML(data.KG) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.Adresse) + '</li>'
    ul.innerHTML += '<li>Grundstücknr.: ' + escHTML(data.GdstNr) + '</li>'
    ul.innerHTML += '<li>Status: ' + escHTML(data.Status) + '</li>'
  }

  wikipediaListeAnchor (ob) {
    return 'objektid-' + ob.id
  }

  recommendedTags (ob) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  compileOverpassQuery (ob) {
    return '(nwr[building](filter);nwr[amenity=fountain](filter);nwr[landuse=cemetery](filter););'
  }
}

module.exports = new DatasetBDA()
