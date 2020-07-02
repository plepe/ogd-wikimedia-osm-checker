module.exports = [
  require('../checks/osmRefBda.js')('ref:at:bda'),
  require('../checks/osmTags.js')(),
  require('../checks/loadWikidata.js')('P2951'),
  require('../checks/wikidataCoords.js')(),
  require('../checks/wikidataIsA.js')(),
  require('../checks/wikidataRecommendations.js')(),
  require('../checks/commonsLoad.js')(),
  require('../checks/commonsImage.js')(),
  require('../checks/commonsWikidataInfobox.js')(),
  require('../checks/wikipediaDenkmalliste.js')(),
  require('../checks/commonsTemplate.js')()
]
