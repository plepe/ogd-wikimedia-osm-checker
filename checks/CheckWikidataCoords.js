const STATUS = require('../src/status.js')
const Check = require('../src/Check.js')

class CheckWikidataCoords extends Check {
  check (ob) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata
    }

    if (ob.data.wikidata.length === 0) {
      return true // loaded, but no wikidata entry found
    }

    if (ob.data.wikidata[0].claims.P625) {
      return true // has coordinates - will be printed by WikidataShow anyway
    }

    return ob.message('wikidata', STATUS.ERROR, 'Eintrag hat keine Koordinaten')
  }
}

module.exports = options => new CheckWikidataCoords(options)
