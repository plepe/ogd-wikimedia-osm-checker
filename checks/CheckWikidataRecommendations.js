const STATUS = require('../src/status.js')
const Check = require('../src/Check.js')

const properties = {
  P84: 'Architekt_in',
  P170: 'Urheber_in',
  P186: 'Material',
  P580: 'Startzeitpunkt',
  P417: 'Patron_in',
  P180: 'Motiv',
  P1684: 'Inschrift',
  P7842: 'Wien Geschichte Wiki ID',
  P8231: 'Wiener Wohnen ID'
}

class CheckWikidataRecommendations extends Check {
  check (ob) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata
    }

    if (ob.data.wikidata.length === 0) {
      return true // loaded, but no wikidata entry found
    }

    const el = ob.data.wikidata[0]

    let recommendations = []

    if (ob.dataset.wikidataRecommendedProperties) {
      recommendations = recommendations.concat(ob.dataset.wikidataRecommendedProperties(ob))
    }

    // unique
    recommendations = [...new Set(recommendations)]
    // filter all recommendations which are already set
    recommendations = recommendations.filter(r => !(r in el.claims))

    if (recommendations.length) {
      return ob.message('wikidata', STATUS.WARNING, 'Empfohlene weitere Angaben: ' + recommendations.map(r => r in properties ? properties[r] : r).join(', '))
    }
  }
}

module.exports = options => new CheckWikidataRecommendations(options)
