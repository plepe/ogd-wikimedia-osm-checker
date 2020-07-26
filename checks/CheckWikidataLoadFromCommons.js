const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const Check =  require('../src/Check.js')

class CheckWikidataLoadFromCommons extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return
    }

    ob.data.commons.forEach(page => {
      if (page.title.match(/^File:/)) {
        // Disable, as this query does not work
        // ob.load('wikidata', {key: 'P18', id: page.title.substr(5)})
      } else if (page.title.match(/^Category:/)) {
        ob.load('wikidata', { key: 'P373', id: page.title.substr(9) })
      }
    })

    return true
  }
}

module.exports = options => new CheckWikidataLoadFromCommons(options)
