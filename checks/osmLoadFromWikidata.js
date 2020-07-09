const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  let wikidataId

  if (ob.data.osm) {
    return true
  }

  if (!ob.data.wikidata && !ob.data.osm) {
    // wait for wikidata info to be loaded
    return
  }

  if (!ob.data.osm && ob.data.wikidata.length) {
    return ob.load('osm', 'nwr[wikidata="' + ob.data.wikidata[0].id + '"];')
  }

  if (ob.data.wikidata.length) {
    wikidataId = ob.data.wikidata[0].id
  } else {
    return ob.message('osm', STATUS.ERROR, 'Kein Eintrag in der OpenStreetMap gefunden!')
  }

  const results = ob.data.osm
  if (results.length) {
    return ob.message('osm', STATUS.SUCCESS, results.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + results.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', '))
  }

  return ob.message('osm', STATUS.ERROR, 'Kein Eintrag <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!')
}
