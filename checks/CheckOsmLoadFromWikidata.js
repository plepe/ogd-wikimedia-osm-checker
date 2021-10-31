const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const Check = require('../src/Check.js')

class CheckOsmLoadFromWikidata extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    let wikidataId

    // OSM object has been loaded by 'osmLoadSimilar'. When re-showing data, let
    // that module do it.
    if (ob.osmSimilar) {
      return
    }

    if (!ob.data.wikidata && !ob.data.osm) {
      // wait for wikidata info to be loaded
      return
    }

    if (!ob.isDone(/^CheckWikidataLoad/)) {
      // wait for all wikidata loaders to finish
      return
    }

    if (ob.data.wikidata.length) {
      wikidataId = ob.data.wikidata[0].id
    }

    if (!ob.data.osm) {
      const loading = ob.data.wikidata.filter(entry => !ob.load('osm', 'nwr[wikidata="' + entry.id + '"];'))
      return !loading.length
    }

    const results = ob.data.osm.filter(el => el.tags.wikidata === wikidataId)
    if (results.length) {
      return ob.message('osm', STATUS.SUCCESS, results.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: <ul>' + results.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
    }

    return ob.message('osm', STATUS.ERROR, 'Kein Eintrag <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!')
  }
}

module.exports = options => new CheckOsmLoadFromWikidata(options)
