const stringSimilarity = require('string-similarity')

const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const getCoords = require('../src/getCoords.js')

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

    let coords = getCoords(ob.refData, options.coordField)
    if (coords) {
      ob.load('osm', query.replace(/\(filter\)/g, '(around:30,' + coords.lat + ',' + coords.lon + ')'))
    }

    ob.data.wikidata.forEach(
      wikidata => {
        if (wikidata.claims.P625) {
          wikidata.claims.P625.forEach(
            P625 => {
              coords = P625.mainsnak.datavalue.value
              ob.load('osm', query.replace(/\(filter\)/g, '(around:30,' + coords.latitude + ',' + coords.longitude + ')'))
            }
          )
        }
      }
    )

    return
  }

  // if one of the OSM objects has a matching wikidata tag, we are happy
  if (ob.data.wikidata.length) {
    let match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidata[0].id)
    if (match.length) {
      return true
    }
  }

  // if one of the OSM objects has a matching refField tag (e.g. ref:at:bda), we are happy
  if (ob.dataset.osmRefField) {
    let match = ob.data.osm.filter(el => el.tags[ob.dataset.osmRefField] === ob.id)
    if (match.length) {
      return true
    }
  }

  let osmPoss = ob.data.osm.filter(el => stringSimilarity.compareTwoStrings(ob.refData[options.nameField], el.tags.name || '') > 0.4)
  if (osmPoss.length) {
    let msg = [
      'Ein Objekt in der Nähe gefunden, das passen könnte',
      'Objekte in der Nähe gefunden, die passen könnten'
    ]

    ob.message('osm', STATUS.SUCCESS, (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
  }
}
