const STATUS = require('../src/status.js')
const Check =  require('../src/Check.js')

class CheckWikidataLoadViaRef extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikidata) {
      return ob.load('wikidata', { key: this.options[0], id: ob.id })
    }

    if (!ob.data.wikidata.length) {
      return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + this.options[1] + ' (' + this.options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }

    const success = ob.data.wikidata.filter(
      entry =>
        entry.claims[this.options[0]] &&
        entry.claims[this.options[0]].filter(
          claim =>
            claim.mainsnak.datavalue.value === ob.id
        )
    )

    if (success.length) {
      ob.message('wikidata', STATUS.SUCCESS, 'Eintrag mit Attribut <i>' + this.options[1] + ' (' + this.options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    } else {
      ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + this.options[1] + ' (' + this.options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
    }
  }
}

module.exports = options => new CheckWikidataLoadViaRef(options)
