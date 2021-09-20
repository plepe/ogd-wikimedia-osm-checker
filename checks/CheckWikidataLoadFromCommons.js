const Check = require('../src/Check.js')

class CheckWikidataLoadFromCommons extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return
    }

    // wait for wikidata to load; if none found, try to find via commons category
    if (!ob.data.wikidata || ob.data.wikidata.length > 0) {
      return

    }

    const loading = ob.data.commons.filter(page => {
      if (page.title.match(/^File:/)) {
        // Disable, as this query does not work
        // ob.load('wikidata', {key: 'P18', id: page.title.substr(5)})
        return false
      } else if (page.title.match(/^Category:/)) {
        return !ob.load('wikidata', { key: 'P373', id: page.title.substr(9) })
      }
    })

    return loading.length === 0
  }
}

module.exports = options => new CheckWikidataLoadFromCommons(options)
