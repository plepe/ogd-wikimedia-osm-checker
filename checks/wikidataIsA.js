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

  const data = ob.data.wikidata[0].claims.P31

  if (!data) {
    return ob.message('wikidata', STATUS.ERROR, 'Objekt hat keine "ist ein(e)" Angabe')
  }

  if (data.length === 1 && data[0].mainsnak.datavalue.value.id === 'Q2065736') {
    return ob.message('wikidata', STATUS.ERROR, 'Objekt ist nur als Kulturgut eingetragen ("ist ein(e)").')
  }
}
