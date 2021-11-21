const STATUS = require('../status.js')
const Check = require('../Check.js')

const properties = require('../../data/wikidataProperties.json')

class CheckWikidataRecommendations extends Check {
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return // wait for other check to load wikidata
    }

    if (!ob.data.wikidataSelected) {
      return true // loaded, but no wikidata entry found
    }

    const el = ob.data.wikidataSelected

    let recommendations = []

    if (dataset.wikidataRecommendedProperties) {
      recommendations = recommendations.concat(dataset.wikidataRecommendedProperties(ob))
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
