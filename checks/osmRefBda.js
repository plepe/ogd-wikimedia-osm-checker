const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  let wikidataId

  if (!ob.data.wikidata && !ob.data.osm) {
    // wait for wikidata info to be loaded
    return
  }

  if (!ob.data.osm && ob.data.wikidata.length) {
    ob.load('osm', 'nwr["ref:at:bda"=' + ob.id + '];')
    return ob.load('osm', 'nwr[wikidata="' + ob.data.wikidata[0].id + '"];')
  }

  if (!ob.data.osm) {
    return ob.load('osm', 'nwr["ref:at:bda"=' + ob.id + '];')
  }

  if (ob.data.wikidata.length) {
    wikidataId = ob.data.wikidata[0].id
  }

  const refBdaResult = ob.data.osm.filter(el => el.tags['ref:at:bda'] === ob.id)
  const refWdResult = ob.data.osm.filter(el => el.tags.wikidata === wikidataId)

  if (refWdResult.length && refBdaResult.length && refWdResult.length === refBdaResult.length) {
    return ob.message('osm', STATUS.SUCCESS, refBdaResult.length + ' Objekt via <tt>ref:at:bda=' + ob.id + '</tt> und <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refBdaResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
  }

  if (refBdaResult.length && refWdResult.length && refBdaResult.length !== refWdResult.length) {
    return ob.message('osm', STATUS.ERROR, 'Unterschiedliche Anzahl von Objekten mit <tt>ref:at:bda=' + ob.id + '</tt> und/oder <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden: ' + ob.data.osm.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
  }

  if (refBdaResult.length) {
    return ob.message('osm', STATUS.SUCCESS, refBdaResult.length + ' Objekt via <tt>ref:at:bda=' + ob.id + '</tt> gefunden: ' + refBdaResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
  }

  //      const wrongWikidata = refBdaResult.filter(entry => !!entry.tags.wikidata)
  //      if (wrongWikidata.length) {
  //        ul.innerHTML += '<li class="error">Eintrag mit anderer Wikidata ID gefunden, potentielles Duplikat: <a target="_blank" href="https://wikidata.org/wiki/' + escHTML(wrongWikidata[0].tags.wikidata) + '">' + escHTML(wrongWikidata[0].tags.wikidata) + '</a></li>'
  //      } else {
  //        ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!</li>'
  //      }

  if (refWdResult.length) {
    ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>ref:at:bda=' + ob.id + '</tt> in der OpenStreetMap gefunden!')
    ob.message('osm', STATUS.SUCCESS, refWdResult.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refWdResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
    return true
  }

  return ob.message('osm', STATUS.ERROR, 'Kein Eintrag mit <tt>ref:at:bda=' + ob.id + '</tt> oder <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!')
}
