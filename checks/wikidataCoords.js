const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

function check (options, ob) {
  if (!ob.data.wikidata) {
    return // wait for other check to load wikidata 
  }
  
  if (ob.data.wikidata.length === 0) {
    return true // loaded, but no wikidata entry found
  }

  if (ob.data.wikidata[0].claims.P625) {
    const coords = ob.data.wikidata[0].claims.P625[0].mainsnak.datavalue.value

    return ob.message('wikidata', STATUS.SUCCESS, 'Eintrag hat Koordinaten: <a target="_blank" href="https://openstreetmap.org/#map=19/' + coords.latitude + '/' + coords.longitude + '">' + coords.latitude + ', ' + coords.longitude + '</a>')
  }

  return ob.message('wikidata', STATUS.WARNING, 'Eintrag hat keine Koordinaten')
}
