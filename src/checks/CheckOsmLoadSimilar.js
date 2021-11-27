const stringSimilarity = require('string-similarity')

const editLink = require('../editLink.js')
const STATUS = require('../status.js')
const osmFormat = require('../osmFormat.js')
const calcDistance = require('../calcDistance.js')
const Check = require('../Check.js')
const getAllCoords = require('../getAllCoords.js')
const idFromRefOrRefValue = require('../idFromRefOrRefValue')
const osmCompileTags = require('../osmCompileTags.js')

class CheckOsmLoadSimilar extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.compileOverpassQuery) {
      return true
    }

    if (!ob.isDone(/^CheckWikidataLoad/)) {
      // wait for all wikidata loaders to finish
      return
    }

    const allCoords = getAllCoords(ob)

    if (!ob.data.osm) {
      const query = dataset.compileOverpassQuery(ob)
      if (!query) {
        return true
      }

      allCoords.forEach(coords => {
        const q = query
          .replace(/\(filter\)/g, '(around:30,' + coords.latitude + ',' + coords.longitude + ')')
          .replace(/\(filter:([0-9]+)\)/g, '(around:$1,' + coords.latitude + ',' + coords.longitude + ')')
        console.log(coords, q)
        ob.load('osm', q)
      })
      return
    }

    // if one of the OSM objects has a matching wikidata tag, we are happy
    if (!ob.osmSimilar && ob.data.wikidataSelected) {
      const match = ob.data.osm.filter(el => el.tags.wikidata === ob.data.wikidataSelected.id)
      if (match.length) {
        return true
      }
    }

    // if one of the OSM objects has a matching refField tag (e.g. ref:at:bda), we are happy
    if (!ob.osmSimilar && dataset.osm && dataset.osm.refField) {
      const id = idFromRefOrRefValue(ob, dataset.osm.refValue)
      if (id !== false && id !== null) {
        const match = ob.data.osm.filter(el => el.tags[dataset.osm.refField] === id)
        if (match.length) {
          return true
        }
      }
    }

    if (!ob.data.osm) {
      return false
    }

    ob.data.osm.forEach(el => {
      const distances = allCoords.map(coords => calcDistance(coords, el.bounds))
      el.distance = Math.min.apply(null, distances)
    })

    const osmPoss = ob.data.osm.concat()

    // Order objects by name similarity or distance
    if (dataset.osm && dataset.osm.refDataNameField) {
      osmPoss.sort((a, b) => {
        const simmA = stringSimilarity.compareTwoStrings(ob.refData[dataset.osm.refDataNameField], a.tags.name || '')
        const simmB = stringSimilarity.compareTwoStrings(ob.refData[dataset.osm.refDataNameField], b.tags.name || '')

        if (simmA > 0.1 || simmB > 0.1) {
          return simmA > simmB ? -1 : 1
        }

        return a.distance - b.distance
      })
    }

    const compiledTags = osmCompileTags(ob, null)

    if (osmPoss.length) {
      const msg = [
        'Ein Objekt in der Nähe gefunden, das passen könnte',
        'Objekte in der Nähe gefunden, die passen könnten'
      ]

      ob.message('osm', STATUS.SUCCESS,
        (osmPoss.length === 1 ? msg[0] : osmPoss.length + ' ' + msg[1]) + ':<ul>' + osmPoss.map(el => '<li>' + osmFormat(el, ob, ' (Entfernung: ' + Math.round(el.distance * 1000) + 'm)') + '</li>').join('') +
        '<li>Neues Objekt anlegen ' + editLink(ob, null, compiledTags) + '.</li>' +
        '</ul>'
      )

      if (osmPoss.length) {
        osmPoss.forEach(el => {
          if (!el.tags.wikidata) {
            return
          }

          ob.load('wikidata', { key: 'id', id: el.tags.wikidata })

          if (ob.data.wikidataSelected && ob.data.wikidataSelected.id === el.tags.wikidata) {
            ob.message('wikidata', STATUS.WARNING, 'Bitte kontrollieren, ob <a target="_blank" href="https://wikidata.org/wiki/' + el.tags.wikidata + '">' + el.tags.wikidata + '</a> der richtige Wikidata Eintrag ist. Er wurde von möglicherweise passendem OpenStreetMap Objekt <a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a> geladen.')
            ob.osmSimilar = true
          }
        })
      }
    } else {
      ob.message('osm', STATUS.ERROR, 'Kein passendes Objekt in der Nähe gefunden' + editLink(ob, null, compiledTags) + '.')
    }
    return true
  }
}

module.exports = options => new CheckOsmLoadSimilar(options)
