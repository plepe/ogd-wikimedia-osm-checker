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

  const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
  if (!categories.length) {
    return true
  }

  const text = categories[0].wikitext
  m = text.match(/\{\{ *Wikidata Infobox *(\||\}\})/i)
  if (m) {
    return ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Wikidata Infobox')
  }

  return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Wikidata Infobox. Füge <tt>{{Wikidata Infobox}}</tt> hinzu.')
}
