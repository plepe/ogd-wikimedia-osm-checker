# Example Dataset
## Dataset
Create a file in `src/datasets`: `DatasetExample.js` and add it to `src/datasets/index.js`.

```js
const Dataset = require('../Dataset')
class DatasetExample extends Dataset {
  id = 'example'

  title = 'Example'

  titleLong = 'Long title for Example'

  operator = 'A.C.M.E.'

  ogdURL = 'https://example.com/'

  ogdInfo = `Longer <b>HTML</b> multiline text, explaining the dataset`

  // read the reference data from 'example.json' in the data-directory
  filename = 'example.json'

  // [optional] either 'json' (default) or 'geojson'. If the file is a 'csv',
  // it will be converted to 'json' at download time (this might change in the
  // future?)
  fileFormat = 'json'

  // [optional] describe source of the dataset; if omitted, you should define a
  // special download function (see at the end of the Dataset.md file) or
  // download the file manually into the data directory.
  source = {
    // URL of the dataset
    url: 'https://example.com/data.json',

    // [optional] format of the dataset, e.g. 'csv', 'json'; default: 'json'
    format: 'json',

    // [optional] format options, depending on the format
    // csv: see possible parameters here: https://www.npmjs.com/package/csvtojson#parameters
    // json: currently none
    formatOptions: {},

    // [optional] encoding of the dataset, e.g. 'iso-8859-1'. default: 'utf-8'
    encoding: 'utf-8',
  }

  // describe reference data
  refData = {
    // important: this field holds the identificator of each item
    idField: 'ID',

    // [optional] How to link to a description of the item on the operator's website
    urlFormat: 'https://example.com/item/{{ item.ID }}',

    // [optional] for a field with coordinates, add this structure; id is the field name, type the encoding (currently supported: 'wkt' = Well-known text)
    // for 'geojson', omit this field
    coordField: {
      id: 'SHAPE',
      type: 'wkt'
    },

    // [optional] add a place filter in the menu. use this field for filtering:
    placeFilterField: 'PLACE',

    // [optional] in the list, which field to show as title field; if omitted,
    // the idField will be used. Optionally you can use a combination from
    // several fields by using TwigJS syntax (see below).
    // Instead of using 'listFieldTitle' and 'listFieldAddress', you could
    // overwrite the function listFormat() and return HTML code or a DOM node.
    listFieldTitle: 'TITLE',

    // [optional] in the list, which field to show as address field; if
    // omitted, empty. Optionally you can use a combination from several fields
    // by using TwigJS syntax.
    listFieldAddress: '{{ item.PLZ }} {{ item.CITY }}, {{ item.ADDRESS }}',

    // [optional] which fields should be shown in the reference data block; if
    // omitted, all key/values of the current item are shown. Alternatively you
    // can create a function `showFormat(item)` which returns HTML code or a
    // DOM node.
    showFields: {
      TITLE: {
        // human-readable field name (if omitted uses the key, thus 'TITLE')
        title: 'Title',
      },
      ADDRESS: {
        title: 'Address',

        // [optional] format, e.g. combination from several fields. Uses TwigJS
        // syntax.
        format: '{{ item.PLZ }} {{ item.CITY }}, {{ item.ADDRESS }}'
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

## Downloader [optional]
If you need a special downloader, create a file in `src/datasets`:
`DownloadExample.js` and add it to `src/datasets/download.js`.

This should load the reference data and create a JSON file in the `data`
folder.

```js
const fetch = require('node-fetch')
const fs = require('fs')

module.exports = function downloadExample (callback) {
  fetch('https://example.com/dataset.json')
    .then(response => response.json())
    .then(data => fs.writeFile('data/example.json', JSON.stringify(data), callback))
}
```
