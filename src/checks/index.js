module.exports = [
  require('./CheckGeocoder')(),
  require('./CheckWikidataAutoselect')(),
  require('./CheckWikidataSelect')(),
  require('./CheckCommonsLoadFromWikidata')(),
  require('./CheckCommonsLoadFromTemplate')(),
  require('./CheckCommonsShowItems')(),
  require('./CheckCommonsTemplate')(),
  require('./CheckCommonsTemplateToWikidata')(),
  require('./CheckCommonsWikidataInfobox')(),
  require('./CheckWikidataShow')(),
  require('./CheckWikidataIsA')(),
  require('./CheckWikidataLoadViaRef')(),
  require('./CheckWikidataLoadViaQuery')(),
  require('./CheckWikidataCoords')(),
  require('./CheckWikidataImage')(),
  require('./CheckWikidataLoadFromCommons')(),
  require('./CheckWikidataRecommendations')(),
  require('./CheckWikipediaListe')(),
  require('./CheckOsmLoadFromRefOrWikidata')(),
  require('./CheckOsmLoadFromWikidata')(),
  require('./CheckOsmLoadSimilar')()
]
