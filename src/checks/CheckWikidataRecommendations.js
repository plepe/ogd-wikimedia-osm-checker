const STATUS = require('../status.js')
const Check = require('../Check.js')

const properties = require('../../data/wikidataProperties.json')

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
