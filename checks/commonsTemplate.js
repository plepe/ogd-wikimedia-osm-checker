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

  let categories = ob.data.commons.filter(el => el.title.match(/Category:/))
  if (!categories.length) {
    return true
  }

  let categoriesWithTemplateID = categories.filter(el => {
    if (!el.title.match(/Category:/)) {
      return false
    }

    let templates = parseMWTemplate(el.wikitext, '(doo|Denkmalgeschütztes Objekt Österreich)')
    return !!templates.filter(r => r[1] === ob.id).length
  })

  if (categoriesWithTemplateID.length) {
    ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Referenz auf Datensatz.')
  } else {
    ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Referenz zu Datensatz. Füge <tt>{{Denkmalgeschütztes Objekt Österreich|' + ob.id + '}}</tt> hinzu.')
  }

  return true
}
