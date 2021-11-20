const escHTML = require('html-escape')

const Dataset = require('../Dataset')

const checks = [
  // require('../checks/CheckCommonsLoadFromTemplate.js')('/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/'),
  require('../checks/CheckCommonsLoadFromWikidata.js')({
    template: '/\\{\\{(Doo|doo|Denkmalgeschütztes Objekt Österreich)\\|(1=)*$1\\}\\}/',
    property: 'P2951'
  }),
  require('../checks/CheckCommonsShowItems.js')(),
  require('../checks/CheckWikidataLoadViaRef.js')(['P9154', 'HERIS-ID der Datenbank österreichischer Kulturdenkmale']),
  // require('../checks/CheckWikidataLoadFromCommons.js')(),
  require('../checks/CheckWikidataShow.js')(),
  require('../checks/CheckWikidataCoords.js')(),
  require('../checks/CheckWikidataIsA.js')(),
  require('../checks/CheckWikidataRecommendations.js')(),
  require('../checks/CheckCommonsLoad.js')(),
  require('../checks/CheckWikidataImage.js')(),
  require('../checks/CheckCommonsWikidataInfobox.js')(),
  require('../checks/CheckWikipediaListe.js')(),
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

  titleLong = 'Denkmalliste des österr. Bundesdenkmalamtes'

  title = 'Bundesdenkmalamt'

  listTitle = 'Denkmal aus Bundesdenkmalamtsliste'

  ogdURL = 'https://bda.gv.at/denkmalverzeichnis/#denkmalliste-gemaess-3-dmsg'

  ogdInfo = `Liste der unter Denkmalschutz stehenden unbeweglichen Denkmale in Österreich.

<p>
<b>Im Jahr 2021 wurden die denkmalgeschützten Objekte in ein neues "Heritage Information System" übertragen und damit neue IDs (genannt "HERIS-ID") vergeben. Also passt gut auf, dass diese nicht mit den alten "Objekt-IDs" verwechselt werden.</b>
</p>

<ul>
<li>In der <b>Wikipedia</b> gibt es für jede österreichische Gemeinde Seiten mit Listen zu denkmalgeschützten Objekten, welche via Bot aktualisiert werden. Die neuen HERIS-IDs stehen allerdings nicht im Source-Code, sondern werden aus Wikidata geladen. Dafür hat jedes Objekt ein "WD-Item" Feld mit der Wikidata-ID.
<li>In <b>Wikidata</b> gibt es für jedes Objekt einen Eintrag (via Bot gepflegt), erkennbar am Property "Heritage Information System ID der Datenbank österreichischer Kulturdenkmale" (P9154) welches die ID aus dem Katalog enthält. Objekte mit alter Objekt-ID haben außerdem ein Property "Objekt-ID der Datenbank österreichischer Kulturdenkmale" (P2951).</li>
<li>In <b>Wikimedia Commons</b> sollte es zumindest ein Bild für jedes Objekt geben. Gibt es mehrere Bilder (oder andere Medien), sollten diese in eine Kategorie zusammengefasst werden, die dann von Wikipedia Liste und Wikidata verlinkt werden. Es gibt die Vorlage <tt>{{Denkmalgeschütztes Objekt Österreich|1=12345}}</tt>, diese enthält aber die alte Objekt-ID. Für die HERIS-ID gibt es (noch?) keine Vorlage. Außerdem kriegt die Kategorie eine "Infobox".</li>
<li>In <b>OpenStreetMap</b> sollten die meisten Objekte erfasst sein (zumindest wenn es sich um Gebäude oder Denkmäler handelt). Es gibt ein Tag "ref:at:bda", welches die Objekt-ID des Objektes enthält, für die HERIS-ID gibt es (noch?) kein Tag (siehe <a href="https://wiki.openstreetmap.org/wiki/Talk:Key:ref:at:bda">diese Diskussion</a>. Es sollte auf jeden fall ein Verweis auf das Wikidata-Objekt eingetragen sein (Tag "wikidata").</li>
</ul> `

  filename = 'bda.json'

  idField = 'HERIS-ID'

  // osmRefField = 'ref:at:bda'

  wikipediaList = {
    list: 'AT-BDA',
    idPrefix: 'id-',
    wikidataField: 'WD-Item',
    latitudeField: 'Breitengrad',
    longitudeField: 'Längengrad',
    articleField: 'Artikel',
    showFields: ['Name', 'Beschreibung', 'Anmerkung']
  }

  ortFilterField = 'Gemeinde'

  commonsTemplateRegexp = '(doo|Denkmalgeschütztes Objekt Österreich)'

  commonsTemplate = '{{Denkmalgeschütztes Objekt Österreich|$1}}'

  checks = checks

  listEntry (entry) {
    return {
      id: entry['HERIS-ID'],
      text: '<span class="Katalogtitel">' + escHTML(entry.Katalogtitel) + '</span><span class="Adresse">' + escHTML(entry.Adresse) + '</span>'
    }
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
    const list = ['P84', 'P170', 'P580', 'P417', 'P180']

    if (ob.refData.Gemeinde === 'Wien') {
      list.push('P7842') // Wien Geschichte Wiki ID (siehe Seiteninformationen)
    }

    return list
  }

  recommendedTags (ob) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  missingTags (ob) {
    const result = ['heritage=2', 'heritage:operator=bda']

    // result.push('ref:at:bda=' + ob.id)
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
