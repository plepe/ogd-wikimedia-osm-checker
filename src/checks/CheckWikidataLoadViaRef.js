const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataLoadViaRef extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.load('wikidata', { key: ob.dataset.wikidata.refProperty, id: ob.id })) {
      return false
    }

    if (!ob.data.wikidata.length) {
      return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + ob.dataset.wikidata.refPropertyTitle + ' (' + ob.dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }

    const success = ob.data.wikidata.filter(
      entry =>
        entry.claims[ob.dataset.wikidata.refProperty] &&
        entry.claims[ob.dataset.wikidata.refProperty].filter(
          claim =>
            claim.mainsnak.datavalue.value === ob.id
        )
    )

    if (success.length) {
      ob.message('wikidata', STATUS.SUCCESS, 'Eintrag mit Attribut <i>' + ob.dataset.wikidata.refPropertyTitle + ' (' + ob.dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    } else {
      ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + ob.dataset.wikidata.refPropertyTitle + ' (' + ob.dataset.wikidata.refProperty + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }

    return true
  }
}

module.exports = options => new CheckWikidataLoadViaRef(options)
