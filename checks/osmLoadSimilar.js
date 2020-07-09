const stringSimilarity = require('string-similarity')

const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.wikidata) { // wait for wikidata info to be populated
    return
  }

  if (!ob.data.osm && ob.data.wikidata) {
    let query = ob.dataset.compileOverpassQuery(ob)
    if (query === null) {
      return true
    }

    let coords = ob.refData.SHAPE.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    query = query.replace(/\(filter\)/g, '(around:30,' + coords[2] + ',' + coords[1] + ')')
    return ob.load('osm', query)
  }

  // if one of the OSM objects has a matching wikidata tag, we are happy
  if (ob.data.wikidata.length) {
    let match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidata[0].id)
    if (match.length) {
      return true
    }
  }

  let osmPoss = ob.data.osm.filter(el => stringSimilarity.compareTwoStrings(ob.refData.OBJEKTTITEL, el.tags.name || '') > 0.4)
  if (osmPoss.length) {
    let msg = [
      'Ein Objekt in der Nähe gefunden, das passen könnte',
      'Objekte in der Nähe gefunden, die passen könnten'
    ]

    ob.message('osm', STATUS.SUCCESS, (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
  }

return

  const results = ob.data.osm
  if (results.length) {
    return ob.message('osm', STATUS.SUCCESS, results.length + ' Objekt via query gefunden: ' + results.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
  }

  return ob.message('osm', STATUS.ERROR, 'Kein Eintrag <tt>wikidata=</tt> in der OpenStreetMap gefunden!')
}
