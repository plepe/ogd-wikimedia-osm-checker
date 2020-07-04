const escHTML = require('html-escape')

module.exports = {
  filename: 'bda.json',

  idField: 'ObjektID',

  checks: [
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
    require('../checks/commonsTemplate.js')()
  ],

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
}
