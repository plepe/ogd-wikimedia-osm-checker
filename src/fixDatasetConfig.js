const chapters = ['refData', 'file', 'source', 'wikipediaList', 'wikidata', 'commons', 'osm']

module.exports = function fixDatasetConfig (def) {
  chapters.forEach(k => {
    if (k in def && !def[k]) {
      def[k] = {}
    }
  })
}
