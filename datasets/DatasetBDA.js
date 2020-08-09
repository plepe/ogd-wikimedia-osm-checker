const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const checks = [
  require('../checks/CheckCommonsLoadFromTemplate.js')('/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/'),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P2951', 'Objekt-ID der Datenbank österreichischer Kulturdenkmale']),
  require('../checks/CheckWikidataLoadFromCommons.js')(),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckWikipediaListe.js')({
    template: 'Denkmalliste Österreich Tabellenzeile',
    idField: 'ObjektID',
    showFields: ['Name', 'Beschreibung', 'Anmerkung']
  }),
  require('../checks/CheckCommonsTemplate.js')({
    template: '(doo|Denkmalgeschütztes Objekt Österreich)',
    insert: '{{Denkmalgeschütztes Objekt Österreich|$1}}'
  }),
  require('../checks/CheckOsmLoadFromRefOrWikidata.js')(),
  require('../checks/CheckOsmLoadSimilar.js')({
    nameField: 'Bezeichnung'
  })
]

class DatasetBDA extends Dataset {
  id = 'bda'

  title = 'Bundesdenkmalamt'

  listTitle = 'Denkmal aus Bundesdenkmalamtsliste'

  ogdURL = 'https://bda.gv.at/denkmalverzeichnis/#denkmalliste-gemaess-3-dmsg'

  ogdInfo = 'Liste der unter Denkmalschutz stehenden unbeweglichen Denkmale in Österreich.'

  filename = 'bda.json'

  idField = 'ObjektID'

  osmRefField = 'ref:at:bda'

  wikipediaListeSearchTitle = '"Liste der denkmalgeschützten Objekte in"'

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

  missingTags (ob) {
    let result = ['heritage=2', 'heritage:operator=bda']

    result.push('ref:at:bda=' + ob.id)
    if (ob.data.wikidata.length) {
      result.push('wikidata=' + ob.data.wikidata[0].id)
    }

    return result
  }

  compileOverpassQuery (ob) {
    return '(nwr[building](filter);nwr[amenity~"^(grave_yard|fountain)$"](filter);nwr[landuse=cemetery](filter);nwr[historic](filter););'
  }
}

module.exports = new DatasetBDA()
