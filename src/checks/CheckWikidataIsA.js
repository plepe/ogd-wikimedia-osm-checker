const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataIsA extends Check {
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata
    }

    if (!ob.data.wikidataSelected) {
      return true // loaded, but no wikidata entry found
    }

    const data = ob.data.wikidataSelected.claims.P31

    if (!data) {
      return ob.message('wikidata', STATUS.ERROR, 'Objekt hat keine "ist ein(e)" Angabe')
    }

    if (data.length === 1 && data[0].mainsnak.datavalue.value.id === 'Q2065736') {
      return ob.message('wikidata', STATUS.ERROR, 'Objekt ist nur als Kulturgut eingetragen ("ist ein(e)").')
    }

    if (data.filter(el => el.mainsnak.datavalue.value.id === 'Q13406463').length) {
      return ob.message('wikidata', STATUS.ERROR, 'Verdacht auf falsches Objekt: ist eine Wikimedia-Liste.')
    }

    if (data.filter(el => el.mainsnak.datavalue.value.id === 'Q5').length) {
      return ob.message('wikidata', STATUS.ERROR, 'Verdacht auf falsches Objekt: ist ein Mensch.')
    }
  }
}

module.exports = options => new CheckWikidataIsA(options)
