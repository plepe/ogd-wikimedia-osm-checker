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

    if (dataset.wikidataRecommendProperties) {
      recommendations = recommendations.concat(dataset.wikidataRecommendProperties(ob))
    }

    // trim strings
    recommendations = recommendations.map(r => r.trim())

    let recommendationsWithValue = recommendations.filter(r => r.match(/=/))
    recommendationsWithValue = recommendationsWithValue.map(r => r.split(/=/))
    recommendations = recommendations.filter(r => !r.match(/=/))

    // unique
    recommendations = [...new Set(recommendations)]
    // filter all recommendations which are already set
    recommendations = recommendations.filter(r => !(r in el.claims))
    recommendationsWithValue = recommendationsWithValue.filter(r => !(r[0] in el.claims &&
      el.claims[r[0]].filter(claim => claim.mainsnak.datavalue.value === r[1] || ('id' in claim.mainsnak.datavalue.value && claim.mainsnak.datavalue.value.id === r[1])).length))

    if (recommendations.length) {
      ob.message('wikidata', STATUS.WARNING, 'Empfohlene weitere Angaben: ' + recommendations.map(r => r in properties ? properties[r] : r).join(', '))
    }

    if (recommendationsWithValue.length) {
      ob.message('wikidata', STATUS.WARNING, 'Fehlende Werte:<br>' + recommendationsWithValue.map(r => (r[0] in properties ? properties[r[0]] : r[0]) + ': ' + r[1]).join('<br>'))
    }

    if (recommendations.length || recommendationsWithValue.length) {
      return true
    }
  }
}

module.exports = options => new CheckWikidataRecommendations(options)
