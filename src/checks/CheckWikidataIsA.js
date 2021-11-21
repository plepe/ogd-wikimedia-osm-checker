const STATUS = require('../status.js')
const Check = require('../Check.js')

const suspiciousObjects = {
  Q5: 'ist ein Mensch.',
  Q4167410: 'ist eine Wikimedia-Begriffsklärungsseite.',
  Q13406463: 'ist eine Wikimedia-Liste.'
}

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

    data.forEach(el => {
      if (el.mainsnak.datavalue.value.id in suspiciousObjects) {
        return ob.message('wikidata', STATUS.ERROR, 'Verdacht auf falsches Objekt: ' + suspiciousObjects[el.mainsnak.datavalue.value.id])
      }
    })
  }
}

module.exports = options => new CheckWikidataIsA(options)
