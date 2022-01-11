const twigRender = require('../twigRender')

const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataLoadViaQuery extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.wikidata || !dataset.wikidata.query) {
      return true
    }

    let id = ob.id

    const query = twigRender(dataset.wikidata.query, ob.templateData())

    if (!ob.load('wikidata', { query })) {
      return false
    }

    return true
  }
}

module.exports = options => new CheckWikidataLoadViaQuery(options)
