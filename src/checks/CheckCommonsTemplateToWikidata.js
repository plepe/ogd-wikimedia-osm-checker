const escHTML = require('html-escape')

const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckCommonsTemplateToWikidata extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return true
    }

    // if we couldn't find a wikidata item, try via category
    if (ob.data.wikidata && ob.data.wikidata.length === 0) {
      ob.data.commons.forEach(page => {
        if (page.title.match(/^File:/)) {
          // Disable, as this query does not work
          // ob.load('wikidata', {key: 'P18', id: page.title.substr(5)})
        } else if (page.title.match(/^Category:/)) {
          ob.load('wikidata', { key: 'P373', id: page.title.substr(9) })
        }
      })
    }

    return true
  }
}

module.exports = options => new CheckCommonsTemplateToWikidata(options)
