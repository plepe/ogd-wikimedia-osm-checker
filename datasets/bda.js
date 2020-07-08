const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const checks = [
  require('../checks/osmRefBda.js')('ref:at:bda'),
  require('../checks/osmTags.js')(),
  require('../checks/wikidataLoadViaRef.js')('P2951'),
  require('../checks/wikidataLoaded.js')(),
  require('../checks/wikidataCoords.js')(),
  require('../checks/wikidataIsA.js')(),
  require('../checks/wikidataRecommendations.js')(),
  require('../checks/commonsLoad.js')(),
  require('../checks/commonsImage.js')(),
  require('../checks/commonsWikidataInfobox.js')(),
  require('../checks/wikipediaDenkmalliste.js')(),
  require('../checks/wikipediaKunstwerkliste.js')({
    template: 'Denkmalliste Österreich Tabellenzeile',
    idField: 'ObjektID',
    showFields: ['Name', 'Beschreibung', 'Anmerkung']
  }),
  require('../checks/commonsTemplate.js')()
]

class DatasetBDA extends Dataset {
  id = 'bda'

  title = 'Bundesdenkmalamt'

  listTitle = 'Denkmal aus Bundesdenkmalamtsliste'

  filename = 'bda.json'

  idField = 'ObjektID'

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

  wikipediaListeTitle (ob) {
    return 'Liste der denkmalgeschützten Objekte in ' + ob.refData.Gemeinde
  }
}

module.exports = new DatasetBDA()
