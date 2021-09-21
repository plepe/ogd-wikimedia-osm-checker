const STATUS = require('../src/status.js')
const Check = require('../src/Check.js')

class CheckCommonsWikidataInfobox extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return
    }

    const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
    if (!categories.length) {
      return true
    }

    const text = categories[0].wikitext
    const m = text.match(/\{\{ *Wikidata Infobox *(\||\}\})/i)
    if (m) {
      return ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Wikidata Infobox')
    }

    if (ob.data.wikidata && ob.data.wikidata.length) {
      return ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Wikidata Infobox. Füge <tt>{{Wikidata Infobox|qid=' + (ob.data.wikidata && ob.data.wikidata.length ? ob.data.wikidata[0].id : '*') + '}}</tt> hinzu.')
    }
  }
}

module.exports = options => new CheckCommonsWikidataInfobox(options)
