const STATUS = require('../src/status.js')
const osmFormat = require('../src/osmFormat.js')
const Check = require('../src/Check.js')

class CheckOsmLoadFromRefOrWikidata extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    let wikidataId

    let id = ob.id
    if (this.options && this.options.wikidataValueProperty) {
      if (!ob.data.wikidata || !ob.data.wikidata.length) {
        return true
      }

      const data = ob.data.wikidata[0].claims[this.options.wikidataValueProperty]
      if (!data || !data.length) {
        id = null
      } else {
        id = data[0].mainsnak.datavalue.value
      }
    }

    let osmRefField = ob.dataset.osmRefField
    if (this.options && this.options.osmRefField) {
      osmRefField = this.options.osmRefField
    }

    // OSM object has been loaded by 'osmLoadSimilar'. When re-showing data, let
    // that module do it.
    if (ob.osmSimilar && id) {
      return ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>' + osmRefField + '=' + id + '</tt> in der OpenStreetMap gefunden!')
    }

    if (!ob.data.wikidata && !ob.data.osm) {
      // wait for wikidata info to be loaded
      return
    }

    if (!ob.isDone(/^CheckWikidataLoad/)) {
      // wait for all wikidata loaders to finish
      return
    }

    const loadingWikidata = ob.data.wikidata.filter(entry => !ob.load('osm', { query: 'nwr[wikidata="' + entry.id + '"];' }))

    let loadingRef = false
    if (id !== null) {
      loadingRef = !ob.load('osm', { query: 'nwr["' + osmRefField + '"=' + id + '];' })
    }

    if (loadingWikidata.length || loadingRef) {
      return false
    }

    if (ob.data.wikidata.length) {
      wikidataId = ob.data.wikidata[0].id
    }

    const refBdaResult = ob.data.osm.filter(el => el.tags[osmRefField] === id)
    let refWdResult = []
    if (wikidataId) {
      refWdResult = ob.data.osm.filter(el => el.tags.wikidata === wikidataId)
    }

    if (refWdResult.length && refBdaResult.length && refWdResult.length === refBdaResult.length) {
      return ob.message('osm', STATUS.SUCCESS, refBdaResult.length + ' Objekt via <tt>' + osmRefField + '=' + id + '</tt> und <tt>wikidata=' + wikidataId + '</tt> gefunden:<ul>' + refBdaResult.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
    }

    if (refBdaResult.length && refWdResult.length && refBdaResult.length !== refWdResult.length) {
      return ob.message('osm', STATUS.ERROR, 'Unterschiedliche Anzahl von Objekten mit <tt>' + osmRefField + '=' + id + '</tt> und/oder <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden: ' + ob.data.osm.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
    }

    if (refBdaResult.length) {
      refBdaResult.forEach(el => {
        if (el.tags.wikidata && ob.data.wikidata.length === 0) {
          ob.load('wikidata', { key: 'id', id: el.tags.wikidata })
        }
      })

      return ob.message('osm', STATUS.SUCCESS, refBdaResult.length + ' Objekt via <tt>' + osmRefField + '=' + id + '</tt> gefunden: ' + refBdaResult.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
    }

    //      const wrongWikidata = refBdaResult.filter(entry => !!entry.tags.wikidata)
    //      if (wrongWikidata.length) {
    //        ul.innerHTML += '<li class="error">Eintrag mit anderer Wikidata ID gefunden, potentielles Duplikat: <a target="_blank" href="https://wikidata.org/wiki/' + escHTML(wrongWikidata[0].tags.wikidata) + '">' + escHTML(wrongWikidata[0].tags.wikidata) + '</a></li>'
    //      } else {
    //        ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!</li>'
    //      }

    if (refWdResult.length) {
      if (id !== null) {
        ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>' + osmRefField + '=' + id + '</tt> in der OpenStreetMap gefunden!')
      }

      ob.message('osm', STATUS.SUCCESS, refWdResult.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refWdResult.map(el => '<li>' + osmFormat(el, ob) + '</li>').join('') + '</ul>')
      return true
    }

    if (id === null) {
      return ob.message('osm', STATUS.ERROR, 'Kein Eintrag ' + (wikidataId ? 'mit <tt>wikidata=' + wikidataId + '</tt>' : '') + ' in der OpenStreetMap gefunden!')
    } else {
      return ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>' + osmRefField + '=' + id + '</tt> ' + (wikidataId ? 'oder <tt>wikidata=' + wikidataId + '</tt>' : '') + ' in der OpenStreetMap gefunden!')
    }
  }
}

module.exports = options => new CheckOsmLoadFromRefOrWikidata(options)
