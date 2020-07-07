const parseMWTemplate = require('../src/parseMWTemplate.js')
const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.commons) {
    return
  }

  if (!ob.data.commons.length) {
    return true
  }

  const text = ob.data.commons[0].wikitext
  const dooTemplates = parseMWTemplate(text, '(doo|Denkmalgeschütztes Objekt Österreich)')
  console.log(dooTemplates)
  if (dooTemplates.filter(r => r[1] === ob.id).length) {
    return ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Verweis auf BDA ID.')
  }

  if (m) {
    return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat Verweis auf falsche BDA ID(s): ' + dooTemplates.map(r => r[1]).join(', '))
  }

  return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keinen Verweis auf BDA ID. Füge <tt>{{Denkmalgeschütztes Objekt Österreich|' + ob.id + '}}</tt> hinzu.')
}
