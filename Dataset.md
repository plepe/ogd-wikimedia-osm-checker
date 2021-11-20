# Example Dataset
## Dataset
Create a file in `src/datasets`: `DatasetExample.js` and add it to `src/datasets/index.js`.

```js
const escHTML = require('html-escape') // needed for the format-functions
const Dataset = require('../Dataset')

class DatasetExample extends Dataset {
  id = 'example'

  titleShort = 'Example'

  titleLong = 'Long title for Example'

  ogdURL = 'https://example.com/'

  ogdInfo = `Longer <b>HTML</b> multiline text, explaining the dataset`

  // read the reference data from 'example.json' in the data-directory
  filename = 'example.json'

  // describe reference data
  refData = {
    // important: this field holds the identificator of each item
    idField: 'ID',

    // if there's a field with coordinates, add this structure; id is the field name, type the encoding (currently supported: 'wkt' = Well-known text)
    coordField: {
      id: 'SHAPE',
      type: 'wkt'
    }

    // add a place filter in the menu. use this field for filtering:
    placeFilterField: 'PLACE'
  }

  // Configuration of the item in a corresponding wikipedia list
  wikipediaList = {
    // id of an existing list in the module https://github.com/plepe/wikipedia-list-extractor
    list: 'AT-BDA',

    // optional id prefix
    idPrefix: 'id-',

    // id of the field referencing the wikidata item
    wikidataField: 'WD-Item',

    // id of the field referencing a wikipedia article
    articleField: 'Article',

    // id of the field referencing the wikimedia commons category
    commonsField: 'Commonscat',

    // id of the field referencing the latitude/longitude of the item's coordinates
    latitudeField: 'Latitude',
    longitudeField: 'Longitude',

    // which fields should be displayed
    showField: ['Name', 'Type', 'Description'],
  }

  // Configuration of the item in Wikidata
  wikidata = {
    // which property holds the reference to this dataset
    refProperty: 'P1234',

    // title of the refProperty
    refPropertyTitle: 'Property Title',
  }

  // Configuration of the item in Wikimedia Commons
  commons = {
    // template for a search via full text search (Cirrus Search); '$1' will be replaced by the ID of the item
    searchRegexp: '/\\{\\{Example\\s*\\|\\s*(1=)*$1(\\|(.*))?\\}\\}/',

    // in the source of each page, search for occurences of this template
    templateRegexp: '[Ee]xample'

    // when no template is found, suggest the following template; '$1' will be replaced by the ID of the item
    templateTemplate: '{{Example|$1}}'

    // optional: instead of the ID of the item, use the value of this wikidata property for 'searchRegexp' and 'templateTemplate'.
    refValue: { wikidataProperty: 'P2951' }
  }

  // Configuration of the item in OpenStreetMap
  osm = {
    // the specified tag holds a reference to the dataset's id
    refField: 'ref:example',

    // optional: instead of the ID of the item, use the value of this wikidata property for 'refField'.
    refValue: { wikidataProperty: 'P2951' }
  }

  // format an item for the list on the left side (may return either an HTML string or a DOM structure)
  listFormat (item) {
    return '<span class="title">' + escHTML(item.TITEL) + '</span><span class="address">' + escHTML(item.ADDRESS) + '</span>'
  }

  // format the details of an item (may return either an HTML string or a DOM structure)
  showFormat (item) {
    return '<h2>Example</h2><ul>' +
      '<li>Title: ' + escHTML(item.TITLE) + '</li>' +
      '</ul>'
  }

  // the wikidata representation of an item should have these properties (ob is an instance of class Examinee)
  wikidataRecommendedProperties (ob) {
    // use ob.refData for the original data from the dataset (e.g. ob.refData.TITLE)
    return [
      'P571', // 'date of inception'
      'P625'  // 'coordinates'
    ]
  }

  // the OSM representation of an item should have these properties
  // - ob is an instance of class Examinee
  // - [optional] osmItem is a result from overpass with: osmItem.type, osmItem.id, osmItem.tags, ...
  osmRecommendedTags (ob, osmItem) {
    return [
      'start_date'
    ]
  }

  // list of tag=value pairs which should be added to the OSM entry
  // - ob is an instance of class Examinee
  // - [optional] osmItem is a result from overpass with: osmItem.type, osmItem.id, osmItem.tags, ...
  osmCompileTags (ob, osmItem) {
    return {
      name: ob.refData.TITLE,
      operator: 'Example'
    }
  }

  // return a query for the current item in Overpass QL (ob is an instance of class Examinee)
  // about Overpass QL: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
  // '(filter)' will be replaced by a bouding box query from the found coordinates
  // if null is returned, no OpenStreetMap objects will be queried
  compileOverpassQuery (ob) {
    return '(nwr[building](filter);nwr[amenity=example](filter););'
  }
}
```

## Downloader
Create a file in `src/datasets`: `DownloadExample.js` and add it to `src/datasets/download.js`.

This should load the reference data and create a JSON file in the `data` folder.

```
const fetch = require('node-fetch')
const fs = require('fs')

module.exports = function downloadExample (callback) {
  fetch('https://example.com/dataset.json')
    .then(response => response.json())
    .then(data => fs.writeFile('data/example.json', JSON.stringify(data), callback))
}
```
