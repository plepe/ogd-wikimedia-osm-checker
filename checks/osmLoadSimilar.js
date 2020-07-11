const stringSimilarity = require('string-similarity')

const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const getCoords = require('../src/getCoords.js')
const calcDistance = require('../src/calcDistance.js')

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

  if (ob.osmSimilar) {
    ob.message('wikidata', STATUS.WARNING, 'Bitte kontrollieren, ob dies der richtige WIkidata Eintrag ist. Er wurde von möglichem OpenStreetMap Objekt geladen.')
  }

  let allCoords = []
  let coords = getCoords(ob.refData, options.coordField)
  if (coords) {
    allCoords.push(coords)
  }

  ob.data.wikidata.forEach(
    wikidata => {
      if (wikidata.claims.P625) {
        wikidata.claims.P625.forEach(
          P625 => {
            allCoords.push(P625.mainsnak.datavalue.value)
          }
        )
      }
    }
  )

  if (!ob.data.osm && ob.data.wikidata) {
    let query = ob.dataset.compileOverpassQuery(ob)
    if (query === null) {
      return true
    }

    allCoords.forEach(coords => ob.load('osm', query.replace(/\(filter\)/g, '(around:30,' + coords.latitude + ',' + coords.longitude + ')')))
    return
  }

  // if one of the OSM objects has a matching wikidata tag, we are happy
  if (!ob.osmSimilar && ob.data.wikidata.length) {
    let match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidata[0].id)
    if (match.length) {
      return true
    }
  }

  // if one of the OSM objects has a matching refField tag (e.g. ref:at:bda), we are happy
  if (!ob.osmSimilar && ob.dataset.osmRefField) {
    let match = ob.data.osm.filter(el => el.tags[ob.dataset.osmRefField] === ob.id)
    if (match.length) {
      return true
    }
  }

  ob.data.osm.forEach(el => {
    let distances = allCoords.map(coords => calcDistance(coords, el.bounds))
    el.distance = Math.min.apply(null, distances)
  })

  let osmPoss = ob.data.osm.filter(el => stringSimilarity.compareTwoStrings(ob.refData[options.nameField], el.tags.name || '') > 0.4)

  // No objects with similar names found, return objects without a name
  if (osmPoss.length === 0) {
    osmPoss = ob.data.osm.filter(el => !el.tags.name)
  }

  // Order objects by distance
  osmPoss.sort((a, b) => a.distance - b.distance)

  if (osmPoss.length) {
    let msg = [
      'Ein Objekt in der Nähe gefunden, das passen könnte',
      'Objekte in der Nähe gefunden, die passen könnten'
    ]

    ob.message('osm', STATUS.SUCCESS, (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob, ' (Entfernung: ' + Math.round(el.distance * 1000) + 'm)') + '</li>').join('') + '</ul>')

    if (osmPoss.length === 1 && osmPoss[0].tags.wikidata && ob.data.wikidata.length === 0) {
      ob.load('wikidata', {key: 'id', id: osmPoss[0].tags.wikidata})
      ob.message('wikidata', STATUS.WARNING, 'Bitte kontrollieren, ob dies der richtige WIkidata Eintrag ist. Er wurde von möglichem OpenStreetMap Objekt geladen.')
      ob.osmSimilar = true
    }
  } else {
    ob.message('osm', STATUS.ERROR, 'Kein passendes Objekt in der Nähe gefunden.')
  }
  return true
}
