const escHTML = require('html-escape')

const Dataset = require('../Dataset')

class DatasetWienerWohnen extends Dataset {
  id = 'wiener-wohnen'

  title = 'Wiener Gemeindebauten'

  titleLong = 'Wiener Gemeindebauten (Wiener Wohnen)'

  listTitle = 'Wiener Gemeindebauten'

  ogdURL = 'https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.html'

  ogdInfo = `<a href='https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.html'>Gemeindebaubeschreibungen auf der Homepage von "Wiener Wohnen"</a>

<ul>
<li>Jeder Gemeindebau hat eine ID, die aus der URL der Wiener Wohnen Homepage auszulesen ist.</li>
<li>In der <b>Wikipedia</b> gibt es für jeden Wiener Bezirk Seiten mit Listen zu Gemeindebauten. Dort wird die ID dieses Objektes (Feld 'ID') aufgeführt, sowie ein Link zum Wikidata Item (Feld 'WD-Item'), falls es einen Eintrag gibt.</li>
<li>In <b>Wikidata</b> gibt es für einige Gemeindebauten einen Eintrag, erkennbar am Property "Wiener Wohen ID" (P8231) welches die Gemeindebau-ID enthält.</li>
<li>In <b>Wikimedia Commons</b> sollte es zumindest ein Bild für jeden Gemeindebau geben. Gibt es mehrere Bilder (oder andere Medien), sollten diese in eine Kategorie zusammengefasst werden, die dann von Wikipedia Liste und Wikidata verlinkt werden. Bilder und Kategorie haben einen Vermerk <tt>{{Wiener Wohnen|123}}</tt> (123 = ID des Objektes) oder <tt>{{Wiener Wohnen|123|name=Hofname}}</tt>. Außerdem kriegt die Kategorie eine "Wikidata Infobox".</li>
<li>In <b>OpenStreetMap</b> kann die Gemeindebau Information entweder auf den Gebäuden und/oder auf einem landuse=residential Polygon erfasst sein. Es gibt kein Tag um die ID des Gemeindebaus zu erfassen, allerdings kann man einen Website-Link auf die Wiener Wohnen Homepage setzen. Wenn es ein Wikidata Objekt gibt, sollte auf jeden fall ein Verweis auf das Wikidata-Objekt eingetragen sein (Tag "wikidata"). Weiters: <tt>operator=Stadt Wien – Wiener Wohnen, ownership=municipal</tt></li>
</ul> `

  filename = 'wiener_wohnen.json'

  idField = 'id'

  wikipediaList = {
    list: 'AT-Wien-Gemeindebauten',
    idPrefix: 'id-',
    wikidataField: 'WD-Item',
    latitudeField: 'Breitengrad',
    longitudeField: 'Längengrad',
    showFields: ['Name', 'Adresse', 'Baujahr', 'Architekt', 'Wohnungen', 'Kunstobjekte', 'Anmerkung']
  }

  wikidata = {
    refProperty: 'P8231',
    refPropertyTitle: 'Wiener Wohnen ID'
  }

  osm = {
    // when search similar objects, use the specified field from refData to compare the name
    refDataNameField: 'name'
  }

  ortFilterField = 'plz'

  commons = {
    searchRegexp: '/\\{\\{Wiener Wohnen\\s*\\|\\s*(1=)*$1(\\|(.*))?\\}\\}/',
    templateRegexp: 'Wiener Wohnen',
    templateTemplate: '{{Wiener Wohnen|$1}}'
  }

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
    ul.innerHTML += '<li><a target="_blank" href="' + escHTML(data.url) + '">Website</a></li>'

    // const pre = document.createElement('pre')
    // dom.appendChild(pre)
    // pre.appendChild(document.createTextNode(JSON.stringify(data, null, '  ')))
  }

  wikidataRecommendedProperties (ob) {
    const list = ['P84', 'P138', 'P571', 'P1619', 'P7842']

    return list
  }

  recommendedTags (ob) {
    return ['architect', 'architect:wikidata', 'name:etymology', 'name:etymology:wikidata', 'building:levels']
  }

  missingTags (ob) {
    const result = [
      'operator=Stadt Wien – Wiener Wohnen',
      'ownership=municipal',
      'architect=' + (ob.refData.architects.split(/, /).join(';')),
      'construction:start_date=' + ob.refData.constructionStartYear,
      'start_date=' + ob.refData.constructionEndYear
    ]

    result.push('website=' + ob.refData.url)

    if (ob.refData.name !== ob.refData.address) {
      result.push('name=' + ob.refData.name)
    }

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
