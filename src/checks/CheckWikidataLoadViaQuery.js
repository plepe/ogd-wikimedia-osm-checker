const twigRender = require('../twigRender')

const Check = require('../Check.js')

class CheckWikidataLoadViaQuery extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.wikidata || !dataset.wikidata.query) {
      return true
    }

    const query = twigRender(dataset.wikidata.query, ob.templateData())

    return ob.load('wikidata', { query })
  }
}

module.exports = options => new CheckWikidataLoadViaQuery(options)
