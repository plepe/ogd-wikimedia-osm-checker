const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const Check =  require('../src/Check.js')

class CheckCommonsLoadFromTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return ob.load('commons', { search: 'insource:' + this.options.replace(/\$1/g, ob.id) })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
