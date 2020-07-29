const STATUS = require('../src/status.js')
const Check =  require('../src/Check.js')

class CheckWikidataLoaded extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata entry/ies
    }

    const result = ob.data.wikidata
    if (result.length > 1) {
      return ob.message('wikidata', STATUS.ERROR, result.length + ' Objekte gefunden: ' + result.map(el => '<a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>').join(', '))
    }

    if (result.length === 1) {
      const el = ob.data.wikidata[0]
      return ob.message('wikidata', STATUS.SUCCESS, '1 Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>')
    }

    return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag gefunden!')
  }
}

module.exports = options => new CheckWikidataLoaded(options)
