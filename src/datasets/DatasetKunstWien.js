const Dataset = require('../Dataset')

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

  operator = 'Stadt Wien'

  ogdURL = 'https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'

  ogdInfo = `<a href='https://www.wien.gv.at/kultur/kulturgut/kunstwerke/'>Katalog Kunstwerke im öffentlichen Raum Standorte Wien</a>

<ul>
<li>In der <b>Wikipedia</b> gibt es für (fast) jeden Wiener Bezirk Seiten mit Listen zu Kunstwerken und Denkmälern bzw. zu Gedenktafeln und -steinen. Dort wird die ID dieses Objektes (Feld 'ID') aufgeführt, sowie ein Link zum Wikidata Item (Feld 'WD-Item'), falls es einen Eintrag gibt.</li>
<li>In <b>Wikidata</b> gibt es für viele dieser Kunstwerke/Denkmäler einen Eintrag, erkennbar am Property "Wien Kulturgut: Kunstwerke im öffentlichen Raum ID" (P4830) welches die ID aus dem Katalog enthält.</li>
<li>In <b>Wikimedia Commons</b> sollte es zumindest ein Bild für jedes Kunstwerk/Denkmal geben. Gibt es mehrere Bilder (oder andere Medien), sollten diese in eine Kategorie zusammengefasst werden, die dann von Wikipedia Liste und Wikidata verlinkt werden. Bilder und Kategorie haben einen Vermerk <tt>{{Public Art Austria|12345|AT-9}}</tt> (12345 = ID des Objektes). Außerdem kriegt die Kategorie eine "Wikidata Infobox".</li>
<li>In <b>OpenStreetMap</b> sollte jedes Kunstwerk/Denkmal erfasst sein. Es gibt ein Tag "ref:wien:kultur", welches die ID des Objektes enthält. Außerdem sollte ein Verweis auf das Wikidata-Objekt eingetragen sein (Tag "wikidata").</li>
</ul> `

  filename = 'kunstwien.json'

  source = {
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:KUNSTWERKOGD&srsName=EPSG:4326&outputFormat=csv',
    format: 'csv',
    formatOptions: { delimiter: ',' }
  }

  refData = {
    idField: 'ID',
    urlFormat: 'https://www.wien.gv.at/kulturportal/public/grafik.aspx?FeatureByID={{ item.ID }}&FeatureClass=kunstkultur&ThemePage=4',
    coordField: {
      type: 'wkt',
      id: 'SHAPE'
    },
    placeFilterField: 'PLZ',
    listFieldTitle: 'OBJEKTTITEL',
    listFieldAddress: '{{ item.PLZ }} {{ item.ORT }}, {{ item.STRASSE }}',
    showFields: {
      OBJEKTTITEL: {
        title: 'Titel'
      },
      VULGONAMEN: {
        title: 'Vulgonamen'
      },
      INSCHRIFT: {
        title: 'Inschrift'
      },
      TYP: {
        title: 'Typ'
      },
      ADRESSE: {
        title: 'Adresse',
        format: '{{ item.STRASSE }}, {{ item.PLZ }} {{ item.ORT }}'
      },
      STANDORT: {
        title: 'Standort'
      },
      BESCHREIBUNG: {
        title: 'Beschreibung'
      },
      GESCHICHTE: {
        title: 'Geschichte'
      },
      ENTSTEHUNG: {
        title: 'Entstehung',
        format: '{{ item.ENTSTEHUNG }} (Epoche: {{ item.EPOCHE }})'
      },
      KUENSTLER: {
        title: 'Künstler*in'
      },
      MATERIAL: {
        title: 'Material'
      }
    }
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

  wikidataRecommendedProperties (ob) {
    const list = ['P170', 'P571', 'P1619', 'P417', 'P180', 'P7842']

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
