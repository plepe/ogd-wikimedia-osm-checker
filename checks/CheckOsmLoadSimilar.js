const BoundingBox = require('boundingbox')
const stringSimilarity = require('string-similarity')
const turf = {
  buffer: require('@turf/buffer')
}

const editLink = require('../src/editLink.js')
const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const calcDistance = require('../src/calcDistance.js')
const Check = require('../src/Check.js')
const getAllCoords = require('../src/getAllCoords.js')
const wikidataToOsm = require('../src/wikidataToOsm.js')

class CheckOsmLoadSimilar extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.isDone(/^CheckWikidataLoad/)) {
      // wait for all wikidata loaders to finish
      return
    }

    const allCoords = getAllCoords(ob)

    if (!ob.data.osm && ob.data.wikidata) {
      const query = ob.dataset.compileOverpassQuery(ob)
      if (query === null) {
        return true
      }

      if (!allCoords.length) {
        return true
      }

      let bounds = new BoundingBox(allCoords[0])
      allCoords.forEach(coords => {
        bounds.extend(coords)
      })
      console.log(bounds)

      bounds = turf.buffer(bounds.toGeoJSON(), 30, { units: 'meters' })

      return ob.load('osm', { query, bounds })
    }

    // if one of the OSM objects has a matching wikidata tag, we are happy
    if (!ob.osmSimilar && ob.data.wikidata.length) {
      const match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidata[0].id)
      if (match.length) {
        return true
      }
    }

    // if one of the OSM objects has a matching refField tag (e.g. ref:at:bda), we are happy
    if (!ob.osmSimilar && ob.dataset.osmRefField) {
      const match = ob.data.osm.filter(el => el.tags[ob.dataset.osmRefField] === ob.id)
      if (match.length) {
        return true
      }
    }

    ob.data.osm.forEach(el => {
      const distances = allCoords.map(coords => calcDistance(coords, el.bounds))
      el.distance = Math.min.apply(null, distances)
    })

    const osmPoss = ob.data.osm.concat()

    // Order objects by name similarity or distance
    osmPoss.sort((a, b) => {
      const simmA = stringSimilarity.compareTwoStrings(ob.refData[this.options.nameField], a.tags.name || '')
      const simmB = stringSimilarity.compareTwoStrings(ob.refData[this.options.nameField], b.tags.name || '')

      console.log(simmA, simmB)
      if (simmA > 0.1 || simmB > 0.1) {
        return simmA > simmB ? -1 : 1
      }

      return a.distance - b.distance
    })

    let missTags = []
    if (ob.dataset.missingTags) {
      missTags = missTags.concat(ob.dataset.missingTags(ob))
    }
    missTags = missTags.concat(wikidataToOsm.getMissingTags(ob))
    missTags = Array.from(new Set(missTags)) // unique

    if (osmPoss.length) {
      const msg = [
        'Ein Objekt in der Nähe gefunden, das passen könnte',
        'Objekte in der Nähe gefunden, die passen könnten'
      ]

      ob.message('osm', STATUS.SUCCESS,
        (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob, ' (Entfernung: ' + Math.round(el.distance * 1000) + 'm)') + '</li>').join('') +
        '<li>Neues Objekt anlegen ' + editLink(ob, null, missTags) + '.</li>' +
        '</ul>'
      )

      if (osmPoss.length === 1 && osmPoss[0].tags.wikidata && ob.data.wikidata.length === 0) {
        ob.load('wikidata', { key: 'id', id: osmPoss[0].tags.wikidata })
        ob.message('wikidata', STATUS.WARNING, 'Bitte kontrollieren, ob <a target="_blank" href="https://wikidata.org/wiki/' + osmPoss[0].tags.wikidata + '">' + osmPoss[0].tags.wikidata + '</a> der richtige Wikidata Eintrag ist. Er wurde von möglicherweise passendem OpenStreetMap Objekt <a target="_blank" href="https://openstreetmap.org/' + osmPoss[0].type + '/' + osmPoss[0].id + '">' + osmPoss[0].type + '/' + osmPoss[0].id + '</a> geladen.')
        ob.osmSimilar = true
      }
    } else {
      ob.message('osm', STATUS.ERROR, 'Kein passendes Objekt in der Nähe gefunden' + editLink(ob, null, missTags) + '.')
    }
    return true
  }
}

module.exports = options => new CheckOsmLoadSimilar(options)
