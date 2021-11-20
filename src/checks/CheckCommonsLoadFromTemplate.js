const Check = require('../Check.js')

class CheckCommonsLoadFromTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return ob.load('commons', { search: 'insource:' + ob.dataset.commons.searchRegexp.replace(/\$1/g, ob.id) })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
