const STATUS = require('../status.js')
const Check = require('../Check.js')
const wikidataFormat = require('../wikidataFormat.js')

class CheckWikidataShow extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata entry/ies
    }

    if (!ob.data.wikidataSelected) {
      return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag gefunden!')
      return true
    }

    const el = ob.data.wikidataSelected
    return ob.message('wikidata', STATUS.SUCCESS, 'Wikidata Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>:\n' + wikidataFormat(el))
  }
}

module.exports = options => new CheckWikidataShow(options)
