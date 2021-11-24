const escHTML = require('html-escape')

const Dataset = require('../Dataset')
const createGeoLink = require('../createGeoLink')

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

class DatasetKunstWien extends Dataset {
  id = 'kunstwien'

  title = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  titleLong = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  listTitle = 'Kunstwerke im öff. Raum (Kulturgut Wien)'

  ogdURL = 'https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'

  ogdInfo = `<a href='https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'>Katalog Kunstwerke im öffentlichen Raum Standorte Wien</a>

<ul>
<li>In der <b>Wikipedia</b> gibt es für (fast) jeden Wiener Bezirk Seiten mit Listen zu Kunstwerken und Denkmälern bzw. zu Gedenktafeln und -steinen. Dort wird die ID dieses Objektes (Feld 'ID') aufgeführt, sowie ein Link zum Wikidata Item (Feld 'WD-Item'), falls es einen Eintrag gibt.</li>
<li>In <b>Wikidata</b> gibt es für viele dieser Kunstwerke/Denkmäler einen Eintrag, erkennbar am Property "Wien Kulturgut: Kunstwerke im öffentlichen Raum ID" (P4830) welches die ID aus dem Katalog enthält.</li>
<li>In <b>Wikimedia Commons</b> sollte es zumindest ein Bild für jedes Kunstwerk/Denkmal geben. Gibt es mehrere Bilder (oder andere Medien), sollten diese in eine Kategorie zusammengefasst werden, die dann von Wikipedia Liste und Wikidata verlinkt werden. Bilder und Kategorie haben einen Vermerk <tt>{{Public Art Austria|12345|AT-9}}</tt> (12345 = ID des Objektes). Außerdem kriegt die Kategorie eine "Wikidata Infobox".</li>
<li>In <b>OpenStreetMap</b> sollte jedes Kunstwerk/Denkmal erfasst sein. Es gibt ein Tag "ref:wien:kultur", welches die ID des Objektes enthält. Außerdem sollte ein Verweis auf das Wikidata-Objekt eingetragen sein (Tag "wikidata").</li>
</ul> `

  filename = 'kunstwien.json'

  refData = {
    idField: 'ID',
    coordField: {
      type: 'wkt',
      id: 'SHAPE'
    },
    placeFilterField: 'PLZ'
  }

  wikipediaList = {
    list: 'AT-Wien-Kultur',
    idPrefix: 'id-',
    wikidataField: 'WD-Item',
    latitudeField: 'Breitengrad',
    longitudeField: 'Längengrad',
    articleField: 'Artikel',
    showFields: ['Name', 'Name-Vulgo', 'Typ', 'Beschreibung', 'Standort', 'Künstler', 'Inschrift']
  }

  wikidata = {
    refProperty: 'P8430',
    refPropertyTitle: 'Wien Kulturgut: Kunstwerke im öffentlichen Raum ID'
  }

  commons = {
    searchRegexp: '/\\{\\{[Pp]ublic Art Austria\\s*\\|\\s*(1=)*$1\\|\\s*(2=)*AT-9\\}\\}/',
    templateRegexp: 'Public Art Austria',
    templateTemplate: '{{Public Art Austria|$1|AT-9}}'
  }

  osm = {
    refField: 'ref:wien:kultur',
    // when search similar objects, use the specified field from refData to compare the name
    refDataNameField: 'OBJEKTTITEL'
  }

  listFormat (item) {
    return '<span class="Bezeichnung">' + escHTML(item.OBJEKTTITEL) + '</span><span class="Adresse">' + escHTML(item.STRASSE) + '</span>'
  }

  showFormat (item) {
    const div = document.createElement('div')

    div.innerHTML = '<h2>Stadt Wien</h2>'

    const ul = document.createElement('ul')
    div.appendChild(ul)

    ul.innerHTML += '<li>ID: ' + item.ID + '</li>'
    ul.innerHTML += '<li>Titel: ' + escHTML(item.OBJEKTTITEL) + '</li>'
    ul.innerHTML += '<li>Vulgonamen: ' + escHTML(item.VULGONAMEN) + '</li>'
    ul.innerHTML += '<li>Inschrift: ' + escHTML(item.INSCHRIFT) + '</li>'
    ul.innerHTML += '<li>Typ: ' + escHTML(item.TYP) + '</li>'
    ul.innerHTML += '<li>Adresse: ' + escHTML(item.STRASSE) + ', ' + escHTML(item.PLZ) + ' ' + escHTML(item.ORT) + '</li>'
    ul.innerHTML += '<li>Koordinaten: ' + createGeoLink(item, this.refData.coordField) + '</li>'
    ul.innerHTML += '<li>Standort: ' + escHTML(item.STANDORT) + '</li>'
    ul.innerHTML += '<li>Beschreibung: ' + escHTML(item.BESCHREIBUNG) + '</li>'
    ul.innerHTML += '<li>Geschichte: ' + escHTML(item.GESCHICHTE) + '</li>'
    ul.innerHTML += '<li>Entstehung: ' + escHTML(item.ENTSTEHUNG) + ' (' + escHTML(item.EPOCHE) + ')</li>'
    ul.innerHTML += '<li>Künstler*in: ' + escHTML(item.KUENSTLER) + '</li>'
    ul.innerHTML += '<li>Material: ' + escHTML(item.MATERIAL) + '</li>'

    // const pre = document.createElement('pre')
    // dom.appendChild(pre)
    // pre.appendChild(document.createTextNode(JSON.stringify(item, null, '  ')))
    return div
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

  osmRecommendedTags (ob, osmItem) {
    return ['artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']
  }

  osmCompileTags (ob, osmItem) {
    const result = {
      'ref:wien:kultur': ob.id
    }

    return result
  }

  compileOverpassQuery (ob, filter) {
    return typ2OverpassQuery[ob.refData.TYP]
  }
}

module.exports = new DatasetKunstWien()
