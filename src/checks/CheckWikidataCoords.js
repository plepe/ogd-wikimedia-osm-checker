const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataCoords extends Check {
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata
    }

    if (!ob.data.wikidataSelected) {
      return true // loaded, but no wikidata entry found
    }

    if (ob.data.wikidataSelected.claims.P625) {
      return true // has coordinates - will be printed by WikidataShow anyway
    }

    return ob.message('wikidata', STATUS.ERROR, 'Eintrag hat keine Koordinaten')
  }
}

module.exports = options => new CheckWikidataCoords(options)
