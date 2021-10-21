const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const checks = [
  //require('../checks/CheckCommonsLoadFromTemplate.js')('/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/'),
  require('../checks/CheckCommonsLoadFromWikidata.js')({
    template: '/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/',
    property: 'P2951'
  }),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P9154', 'HERIS-ID der Datenbank österreichischer Kulturdenkmale']),
  //require('../checks/CheckWikidataLoadFromCommons.js')(),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckWikipediaListe.js')({
    showFields: ['Name', 'Beschreibung', 'Anmerkung']
  }),
  require('../checks/CheckCommonsTemplate.js')({
    wikidataValueProperty: 'P2951'
  }),
  require('../checks/CheckOsmLoadFromRefOrWikidata.js')({
    wikidataValueProperty: 'P2951',
    osmRefField: 'ref:at:bda'
  }),
  require('../checks/CheckOsmLoadSimilar.js')({
    nameField: 'Katalogtitel'
  })
]

class DatasetBDA extends Dataset {
  id = 'bda'

  title = 'Bundesdenkmalamt'

  listTitle = 'Denkmal aus Bundesdenkmalamtsliste'

  ogdURL = 'https://bda.gv.at/denkmalverzeichnis/#denkmalliste-gemaess-3-dmsg'

  ogdInfo = 'Liste der unter Denkmalschutz stehenden unbeweglichen Denkmale in Österreich.'

  filename = 'bda.json'

  idField = 'HERIS-ID'

  //osmRefField = 'ref:at:bda'

  wikipediaList = 'AT-BDA'

  wikipediaListPrefix = 'id-'

  ortFilterField = 'Gemeinde'

  commonsTemplateRegexp = '(doo|Denkmalgeschütztes Objekt Österreich)'

  commonsTemplate = '{{Denkmalgeschütztes Objekt Österreich|$1}}'

  checks = checks

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    tr.appendChild(td)

    const a = document.createElement('a')
    a.innerHTML = '<span class="Katalogtitel">' + escHTML(entry.Katalogtitel) + '</span><span class="Adresse">' + escHTML(entry.Adresse) + '</span>'
    a.href = '#' + this.id + '/' + entry['HERIS-ID']
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

    ul.innerHTML += '<li>ID: ' + data['HERIS-ID'] + '</li>'
    ul.innerHTML += '<li>Katalogtitel: ' + escHTML(data.Katalogtitel) + '</li>'
    ul.innerHTML += '<li>Gemeinde: ' + escHTML(data.Gemeinde) + '</li>'
    ul.innerHTML += '<li>Kat.gemeinde: ' + escHTML(data.KG) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.Adresse) + '</li>'
    ul.innerHTML += '<li>Grundstücknr.: ' + escHTML(data['GSTK-Nr.']) + '</li>'
    ul.innerHTML += '<li>Status: ' + escHTML(data.Denkmalschutzstatus) + '</li>'
  }

  wikipediaListeAnchor (ob) {
    if (ob.data.wikidata && ob.data.wikidata.length) {
      return ob.data.wikidata[0].id
    }

    return ''
  }

  wikidataRecommendedProperties (ob) {
    const list = ['P84', 'P170', 'P186', 'P580', 'P417', 'P180']

    return list
  }

  recommendedTags (ob) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  missingTags (ob) {
    const result = ['heritage=2', 'heritage:operator=bda']

    //result.push('ref:at:bda=' + ob.id)
    if (ob.data.wikidata.length) {
      result.push('wikidata=' + ob.data.wikidata[0].id)
    }

    return result
  }

  compileOverpassQuery (ob) {
    return '(nwr[building](filter);nwr["building:part"](filter);nwr[amenity~"^(grave_yard|fountain|place_of_worship)$"](filter);nwr[landuse=cemetery](filter);nwr[historic](filter););'
  }
}

module.exports = new DatasetBDA()
