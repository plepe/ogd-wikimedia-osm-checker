const escHTML = require('html-escape')

const Dataset = require('../src/Dataset')

const checks = [
  require('../checks/CheckCommonsLoadFromTemplate.js')('/\\{\\{Wiener Wohnen\\s*\\|\\s*(1=)*$1(\\|(.*))?\\}\\}/'),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P8231', 'Wiener Wohnen ID']),
  require('../checks/CheckWikidataLoadFromCommons.js')(),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckCommonsTemplate.js')(),
  require('../checks/CheckWikipediaListe.js')({
    wikidataField: 'WD-Item',
    showFields: ['Name', 'Adresse', 'Baujahr', 'Architekt', 'Wohnungen', 'Kunstobjekte', 'Anmerkung']
  }),
  require('../checks/CheckOsmLoadSimilar.js')({
    nameField: 'name'
  }),
  require('../checks/CheckOsmLoadFromWikidata.js')()
]

class DatasetWienerWohnen extends Dataset {
  id = 'wiener-wohnen'

  title = 'Wiener Gemeindebauten'

  titleLong = 'Wiener Gemeindebauten (Wiener Wohnen)'

  listTitle = 'Wiener Gemeindebauten'

  ogdURL = 'https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.html'

  ogdInfo = ``

  filename = 'wiener_wohnen.json'

  idField = 'id'

  wikipediaList = 'AT-Wien-Gemeindebauten'

  wikipediaListPrefix = 'id-'

  ortFilterField = 'plz'

  commonsTemplateRegexp = 'Wiener Wohnen'

  commonsTemplate = '{{Wiener Wohnen|$1}}'

  checks = checks

  listEntry (entry) {
    return {
      id: entry.id,
      text: '<span class="Bezeichnung">' + escHTML(entry.name) + '</span><span class="Adresse">' + escHTML(entry.address) + '</span>'
    }
  }

  showEntry (data, dom) {
    const div = document.createElement('div')
    dom.appendChild(div)

    div.innerHTML = '<h2>Stadt Wien</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + data.id + '</li>'
    ul.innerHTML += '<li>Name: ' + escHTML(data.name) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(data.address) + '</li>'
    ul.innerHTML += '<li>Bauzeit: ' + escHTML(data.constructionStartYear) + '-' + escHTML(data.constructionEndYear) + '</li>'
    ul.innerHTML += '<li>Architekt_innen: ' + escHTML(data.architects || '') + '</li>'
    ul.innerHTML += '<li>Kunst am Bau: ' + (data.publicArt ? 'ja' : 'nein') + '</li>'
    ul.innerHTML += '<li>Wohnungen: ' + escHTML('flats' in data ? data.flats : 'unbekannt') + '</li>'
    ul.innerHTML += '<li>Lokale: ' + escHTML('commercialSpaces' in data ? data.commercialSpaces : 'unbekannt') + '</li>'
    ul.innerHTML += '<li><a target="_blank" href="https://www.wienerwohnen.at' + escHTML(data.url) + '">Website</a></li>'

    // const pre = document.createElement('pre')
    // dom.appendChild(pre)
    // pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }

  wikidataRecommendedProperties (ob) {
    const list = ['P84', 'P138', 'P571', 'P1619', 'P7842']

    return list
  }

  recommendedTags (ob) {
    return ['architect', 'architect:wikidata', 'historic']
  }

  missingTags (ob) {
    const result = ['architect', 'architect:wikidata', 'historic']

    if (ob.data.wikidata.length) {
      result.push('wikidata=' + ob.data.wikidata[0].id)
    }

    return result
  }

  compileOverpassQuery (ob, filter) {
    return '(nwr[building](filter);nwr[landuse=residential](filter););'
  }
}

module.exports = new DatasetWienerWohnen()
