const escHTML = require('html-escape')

module.exports = {
  filename: 'kunstwien.json',

  idField: 'ID',

  ortFilterField: 'PLZ',

  checks: [
  //  require('../checks/osmRefBda.js')('ref:at:bda'),
    require('../checks/commonsTemplateToWikidata.js')('/\\{\\{[Pp]ublic Art Austria\\s*\\|\\s*(1=)*$1\\|\\s*(2=)*AT-9\\}\\}/'),
    require('../checks/wikidataLoaded.js')(),
  //  require('../checks/loadWikidata.js')('P2951'),
    require('../checks/wikidataCoords.js')(),
    require('../checks/wikidataIsA.js')(),
    require('../checks/wikidataRecommendations.js')(),
  //  require('../checks/commonsLoad.js')(),
    require('../checks/commonsImage.js')(),
    require('../checks/commonsWikidataInfobox.js')(),
  //  require('../checks/wikipediaDenkmalliste.js')(),
    require('../checks/osmLoadFromWikidata.js')(),
  //  require('../checks/commonsTemplate.js')()
    require('../checks/osmTags.js')()
  ],

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    tr.appendChild(td)

    const a = document.createElement('a')
    a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.OBJEKTTITEL) + '</span><span class="Adresse">' + escHTML(entry.STRASSE) + '</span>'
    a.href = '#' + entry.ID
    td.appendChild(a)
    td.appendChild(document.createElement('br'))

    dom.appendChild(tr)
  },

  showEntry (data, dom) {
    const pre = document.createElement('pre')
    dom.appendChild(pre)

    pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }
}
