const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.wikidata) {
    return ob.load('wikidata', ob.id)
  }

  const result = ob.data.wikidata
  if (result.length > 1) {
    return ob.message('wikidata', STATUS.ERROR, result.length + ' Objekte gefunden: ' + result.map(el => '<a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a>').join(', '))
  }

  if (result.length === 1) {
    const el = ob.data.wikidata[0]
    return ob.message('wikidata', STATUS.SUCCESS, '1 Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a>')
  }

  return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag gefunden!')
}
