const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const Check =  require('../src/Check.js')

class CheckOsmLoadFromWikidata extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    let wikidataId

    if (!ob.data.wikidata && !ob.data.osm) {
      // wait for wikidata info to be loaded
      return
    }

    if (!ob.isDone(/^CheckWikidataLoad/)) {
      // wait for all wikidata loaders to finish
      return
    }

    const loadingWikidata = ob.data.wikidata.filter(entry => !ob.load('osm', 'nwr[wikidata="' + entry.id + '"];'))

    if (loadingWikidata.length) {
      return false
    }

    if (ob.data.wikidata.length) {
      wikidataId = ob.data.wikidata[0].id
    }

    let refWdResult = []
    if (wikidataId) {
      refWdResult = ob.data.osm.filter(el => el.tags.wikidata === wikidataId)
    }

    if (refWdResult.length) {
      ob.message('osm', STATUS.SUCCESS, refWdResult.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refWdResult.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
      return true
    }

    return ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!')
  }
}

module.exports = options => new CheckOsmLoadFromWikidata(options)
