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

    if (!ob.load('wikidata', { key: dataset.wikidata.refProperty, id: ob.id })) {
      return false
    }

    if (!ob.data.wikidata.length) {
      return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + dataset.wikidata.refPropertyTitle + ' (' + dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }

    const success = ob.data.wikidata.filter(
      entry =>
        entry.claims[dataset.wikidata.refProperty] &&
        entry.claims[dataset.wikidata.refProperty].filter(
          claim =>
            claim.mainsnak.datavalue.value === ob.id
        )
    )

    if (success.length) {
      ob.message('wikidata', STATUS.SUCCESS, 'Eintrag mit Attribut <i>' + dataset.wikidata.refPropertyTitle + ' (' + dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    } else {
      ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + dataset.wikidata.refPropertyTitle + ' (' + dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }

    return true
  }
}

module.exports = options => new CheckWikidataLoadViaRef(options)
