const stringSimilarity = require('string-similarity')

const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.osm) {
    let query = ob.dataset.compileOverpassQuery(ob)
    if (query === null) {
      return true
    }
    let coords = ob.refData.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    query = query.replace(/\(filter\)/g, '(around:30,' + coords[2] + ',' + coords[1] + ')')
    return ob.load('osm', query)
  }

  const results = ob.data.osm
  if (results.length) {
    return ob.message('osm', STATUS.SUCCESS, results.length + ' Objekt via query gefunden: ' + results.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>:' + stringSimilarity.compareTwoStrings(ob.refData.OBJEKTTITEL, el.tags.name)).join(', '))
  }

  return ob.message('osm', STATUS.ERROR, 'Kein Eintrag <tt>wikidata=</tt> in der OpenStreetMap gefunden!')
}
