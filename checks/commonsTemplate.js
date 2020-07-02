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

  let text = ob.data.commons[0]
  let m = text.match(/\{\{ *(?:doo|Denkmalgeschütztes Objekt Österreich)\|(?:1=)?([0-9]+) *\}\}/i)
  if (m && m[1] === ob.id) {
    return ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Verweis auf BDA ID.')
  }
  
  if (m) {
    return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat Verweis auf falsche BDA ID: ' + m[1])
  }
  
  return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keinen Verweis auf BDA ID. Füge <tt>{{Denkmalgeschütztes Objekt Österreich|' + ob.id + '}}</tt> hinzu.')
}
