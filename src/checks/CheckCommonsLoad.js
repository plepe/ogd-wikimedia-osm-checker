const Check = require('../Check.js')

class CheckCommonsLoad extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikidata) {
      return
    }

    if (ob.data.wikidata.length === 0) {
      return true
    }

    const el = ob.data.wikidata[0]
    if (el.claims.P373) {
      const data = el.claims.P373
      return ob.load('commons', { title: 'Category:' + data[0].mainsnak.datavalue.value })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoad(options)
