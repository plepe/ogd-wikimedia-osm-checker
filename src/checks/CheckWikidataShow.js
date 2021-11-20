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

    const result = ob.data.wikidata
    if (result.length > 1) {
      return ob.message('wikidata', STATUS.ERROR, result.length + ' Objekte gefunden: ' + result.map(el => '<a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>:\n' + wikidataFormat(el)).join(', '))
    }

    if (result.length === 1) {
      const el = ob.data.wikidata[0]
      return ob.message('wikidata', STATUS.SUCCESS, '1 Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>:\n' + wikidataFormat(el)
      )
    }

    return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag gefunden!')
  }
}

module.exports = options => new CheckWikidataShow(options)
