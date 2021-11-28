const twig = require('twig').twig

const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataLoadViaRef extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.wikidata || !dataset.wikidata.refProperty) {
      return true
    }

    let id = ob.id
    if (dataset.wikidata.refFormat) {
      if (!dataset.wikidataRefFormatTemplate) {
        dataset.wikidataRefFormatTemplate = twig({ data: dataset.wikidata.refFormat })
      }

      id = dataset.wikidataRefFormatTemplate.render(ob.templateData())
    }

    if (!ob.load('wikidata', { key: dataset.wikidata.refProperty, id })) {
      return false
    }

    if (!ob.data.wikidataSelected) {
      return true
    }

    const entry = ob.data.wikidataSelected

    const found =
      !!entry.claims[dataset.wikidata.refProperty] &&
      entry.claims[dataset.wikidata.refProperty].filter(
        claim => claim.mainsnak.datavalue.value === id
      ).length

    if (found) {
      ob.message('wikidata', STATUS.SUCCESS, 'Eintrag hat Attribut <i>' + (dataset.wikidata.refPropertyTitle ? dataset.wikidata.refPropertyTitle + ' (' + dataset.wikidata.refProperty + ')' : dataset.wikidata.refProperty) + '</i> mit Wert <i>' + id + '</i>.')
    } else {
      ob.message('wikidata', STATUS.ERROR, 'Eintrag hat kein Attribut <i>' + (dataset.wikidata.refPropertyTitle ? dataset.wikidata.refPropertyTitle + ' (' + dataset.wikidata.refProperty + ')' : dataset.wikidata.refProperty) + '</i> mit Wert <i>' + id + '</i>.')
    }

    return true
  }
}

module.exports = options => new CheckWikidataLoadViaRef(options)
