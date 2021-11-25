# Example Dataset
## Dataset
Create a file in `src/datasets`: `DatasetExample.js` and add it to `src/datasets/index.js`.

```js
const escHTML = require('html-escape') // needed for the format-functions
const createGeoLink = require('../createGeoLink') // might be needed for showFormat()

const Dataset = require('../Dataset')
class DatasetExample extends Dataset {
  id = 'example'

  titleShort = 'Example'

  titleLong = 'Long title for Example'

  operator = 'A.C.M.E.'

  ogdURL = 'https://example.com/'

  ogdInfo = `Longer <b>HTML</b> multiline text, explaining the dataset`

  // read the reference data from 'example.json' in the data-directory
  filename = 'example.json'

  // describe reference data
  refData = {
    // important: this field holds the identificator of each item
    idField: 'ID',

    // [optional] How to link to a description of the item on the operator's website
    urlFormat: 'https://example.com/item/{{ ID }}',

    // [optional] for a field with coordinates, add this structure; id is the field name, type the encoding (currently supported: 'wkt' = Well-known text)
    coordField: {
      id: 'SHAPE',
      type: 'wkt'
    },

    // [optional] add a place filter in the menu. use this field for filtering:
    placeFilterField: 'PLACE',

    // in the list, which field to show as title field; optionally you can use
    // a combination from several fields by using TwigJS syntax.
    listFieldTitle: 'TITLE',

    // in the list, which field to show as address field; optionally you can
    // use a combination from several fields by using TwigJS syntax.
    listFieldAddress: '{{ PLZ }} {{ CITY }}, {{ ADDRESS }}',

    // which fields should be shown in the reference data block; alternatively
    // you can create a function `showFormat(item)` which returns HTML code.
    showFields: {
      TITLE: {
        // human-readable field name (if omitted uses the key, thus 'TITLE')
        title: 'Title',
      },
      ADDRESS: {
        title: 'Address',

        // [optional] format, e.g. combination from several fields. Uses TwigJS
        // syntax.
        format: '{{ PLZ }} {{ CITY }}, {{ ADDRESS }}'
      }
    }
  }

  // [optional] Configuration of the item in a corresponding wikipedia list
  wikipediaList = {
    // id of an existing list in the module https://github.com/plepe/wikipedia-list-extractor
    list: 'AT-BDA',

    // [optional] id prefix
    idPrefix: 'id-',

    // [optional] id of the field referencing the wikidata item
    wikidataField: 'WD-Item',

    // [optional] id of the field referencing a wikipedia article
    articleField: 'Article',

    // [optional] id of the field referencing the wikimedia commons category
    commonsField: 'Commonscat',

    // [optional] id of the fields referencing the latitude/longitude of the item's coordinates
    latitudeField: 'Latitude',
    longitudeField: 'Longitude',

    // [optional] which fields should be displayed
    showField: ['Name', 'Type', 'Description'],
  }

  // [optional] Configuration of the item in Wikidata
  wikidata = {
    // which property holds the reference to this dataset
    refProperty: 'P1234',

    // [optional] title of the refProperty
    refPropertyTitle: 'Property Title'
  }

  // [optional] Configuration of the item in Wikimedia Commons
  commons = {
    // [optional] template for a search via full text search (Cirrus Search); '$1' will be replaced by the ID of the item
    searchRegexp: '/\\{\\{Example\\s*\\|\\s*(1=)*$1(\\|(.*))?\\}\\}/',

    // [optional] in the source of each page, search for occurences of this template
    templateRegexp: '[Ee]xample',

    // [optional] when no template is found, suggest the following template; '$1' will be replaced by the ID of the item
    templateTemplate: '{{Example|$1}}',

    // [optional] instead of the ID of the item, use the value of this wikidata property for 'searchRegexp' and 'templateTemplate'.
    refValue: { wikidataProperty: 'P2951' }
  }

  // [optional] Configuration of the item in OpenStreetMap
  osm = {
    // [optional] the specified tag holds a reference to the dataset's id
    refField: 'ref:example',

    // [optional] instead of the ID of the item, use the value of this wikidata property for 'refField'.
    refValue: { wikidataProperty: 'P2951' },

    // [optional] when search similar objects, use the specified field from refData to compare the name
    refDataNameField: 'TITLE'
  }

  // format an item for the list on the left side (may return either an HTML string or a DOM structure)
  listFormat (item) {
    return '<span class="title">' + escHTML(item.TITEL) + '</span><span class="address">' + escHTML(item.ADDRESS) + '</span>'
  }

  // [optional] format the details of an item (may return either an HTML string or a DOM structure)
  // if omitted, supply 'showFields' in the `refData` structure
  showFormat (item) {
    return '<h2>Example</h2><ul>' +
      '<li>Title: ' + escHTML(item.TITLE) + '</li>' +
      '<li>Koordinaten: ' + createGeoLink(item, this.refData.coordField) + '</li>' +
      '</ul>'
  }

  // [optional] the wikidata representation of an item should have these properties (ob is an instance of class Examinee)
  wikidataRecommendedProperties (ob) {
    // use ob.refData for the original data from the dataset (e.g. ob.refData.TITLE)
    return [
      'P571', // 'date of inception'
      'P625'  // 'coordinates'
    ]
  }

  // [optional] the OSM representation of an item should have these properties
  // - ob is an instance of class Examinee
  // - [optional] osmItem is a result from overpass with: osmItem.type, osmItem.id, osmItem.tags, ...
  osmRecommendedTags (ob, osmItem) {
    return [
      'start_date'
    ]
  }

  // [optional] list of tag=value pairs which should be added to the OSM entry
  // - ob is an instance of class Examinee
  // - [optional] osmItem is a result from overpass with: osmItem.type, osmItem.id, osmItem.tags, ...
  osmCompileTags (ob, osmItem) {
    return {
      name: ob.refData.TITLE,
      operator: 'Example'
    }
  }

  // [optional] query for similar items near coordinates (from refData, wikipediaList and/or wikidata) in OpenStreetMap
  // return a query Overpass QL (parameter 'ob' is an instance of class Examinee)
  // about Overpass QL: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
  // '(filter)' will be replaced by a bouding box query from the found coordinates, extended by 30 meters
  // '(filter:200)' will be replaced by a bounding box query extended by 200 meters (or what ever has been specified)
  // if null is returned, no similar OpenStreetMap objects will be queried
  compileOverpassQuery (ob) {
    // example: loading all nearby buildings; load all objects with amenity=example
    return '(nwr[building](filter);nwr[amenity=example](filter););'
  }
}

module.exports = new DatasetExample()
```

## Downloader
Create a file in `src/datasets`: `DownloadExample.js` and add it to `src/datasets/download.js`.

This should load the reference data and create a JSON file in the `data` folder.

```js
const fetch = require('node-fetch')
const fs = require('fs')

module.exports = function downloadExample (callback) {
  fetch('https://example.com/dataset.json')
    .then(response => response.json())
    .then(data => fs.writeFile('data/example.json', JSON.stringify(data), callback))
}
```
