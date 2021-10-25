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
    wikidataField: 'WD-Item',
    showFields: ['Name', 'Name-Vulgo', 'Typ', 'Beschreibung', 'Standort', 'Künstler', 'Inschrift']
  }),
  require('../checks/CheckOsmLoadSimilar.js')({
    nameField: 'OBJEKTTITEL'
  }),
  require('../checks/CheckOsmLoadFromRefOrWikidata.js')()
]

class DatasetKunstWien extends Dataset {
  id = 'kunstwien'

  title = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  titleLong = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  listTitle = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  ogdURL = 'https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'

  ogdInfo = `<a href='https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'>Katalog Kunstwerke im öffentlichen Raum Standorte Wien</a>

<ul>
<li>In der Wikipedia gibt es für (fast) jeden Wiener Bezirk Seiten mit Listen zu Kunstwerken und Denkmälern bzw. zu Gedenktafeln und -steinen. Dort wird die ID dieses Objektes (Feld 'ID') aufgeführt, sowie ein Link zum Wikidata Item (Feld 'WD-Item'), falls es einen Eintrag gibt.</li>
<li>In Wikidata sind gibt es für viele dieser Kunstwerke/Denkmäler einen Eintrag, erkennbar am Property "Wien Kulturgut: Kunstwerke im öffentlichen Raum ID" (P4830) welches die ID aus dem Katalog enthält.</li>
<li>In Wikimedia Commons sollte es zumindest ein Bild für jedes Kunstwerk/Denkmal geben. Gibt es mehrere Bilder (oder andere Medien), sollten diese in eine Kategorie zusammengefasst werden, die dann von Wikipedia Liste und Wikidata verlinkt werden. Bilder und Kategorie haben einen Vermerk <tt>{{Public Art Austria|12345|AT-9}}</tt> (12345 = ID des Objektes). Außerdem kriegt die Kategorie eine "Infobox".</li>
<li>In OpenStreetMap sollte jedes Kunstwerk/Denkmal erfasst sein. Es gibt ein Tag "ref:wien:kultur", welches die ID des Objektes enthält. Außerdem sollte ein Verweis auf das Wikidata-Objekt eingetragen sein (Tag "wikidata").</li>
</ul> `

  filename = 'kunstwien.json'

  idField = 'ID'

  osmRefField = 'ref:wien:kultur'

  coordField = {
    type: 'shape',
    id: 'SHAPE'
  }

  wikipediaList = 'AT-Wien-Kultur'

  wikipediaListPrefix = 'id-'

  ortFilterField = 'PLZ'

  commonsTemplateRegexp = 'Public Art Austria'

  commonsTemplate = '{{Public Art Austria|$1|AT-9}}'

  checks = checks

  listEntry (entry, dom) {
    const tr = document.createElement('tr')
    tr.id = this.id + '-' + entry.ID

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
    ul.innerHTML += '<li>Inschrift: ' + escHTML(data.INSCHRIFT) + '</li>'
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

  wikidataRecommendedProperties (ob) {
    const list = ['P170', 'P580', 'P417', 'P180', 'P7842']

    if (ob.refData.INSCHRIFT) {
      list.push('P1684')
    }

    if (ob.refData.MATERIAL) {
      list.push('P186')
    }

    if (ob.data.wikipedia && ob.data.wikipedia.length) {
      const el = ob.data.wikipedia[0]

      if (el.Inschrift) {
        list.push('P1684')
      }
    }

    return list
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
