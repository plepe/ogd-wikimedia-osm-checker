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

    if (dataset.wikidata.refProperty && !ob.isDone('CheckWikidataLoadViaRef')) {
      // wait for the 'LoadViaRef' loader to finish
      return false
    }

    if (dataset.wikidata.refProperty && ob.data.wikidataSelected) {
      const entry = ob.data.wikidataSelected
      const found =
        !!entry.claims[dataset.wikidata.refProperty] &&
        entry.claims[dataset.wikidata.refProperty].filter(
          claim => claim.mainsnak.datavalue.value === ob.id
        ).length
      // selected wikidata object has correct ref - no need to query
      if (found) {
        return true
      }
    }

    const query = twigRender(dataset.wikidata.query, ob.templateData())

    return ob.load('wikidata', { query })
  }
}

module.exports = options => new CheckWikidataLoadViaQuery(options)
