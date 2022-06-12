const Check = require('../Check.js')

class CheckWikidataSelect extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.wikidata || !ob.data.wikidata.length) {
      return true
    }

    if (ob.data.wikidataSelected === undefined) {
      ob.data.wikidataSelected = ob.data.wikidata[0]
      ob.data.wikidataStatus = null
    }
  }
}

module.exports = options => new CheckWikidataSelect()
