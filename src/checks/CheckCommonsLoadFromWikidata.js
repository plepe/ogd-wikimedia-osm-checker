const Check = require('../Check.js')

class CheckCommonsLoadFromWikidata extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikidata) {
      return false
    }

    if (!ob.data.commons) {
      const data = ob.data.wikidata[0].claims[this.options.property]

      if (!data) {
        return true
      }

      data.forEach(d => {
        const id = d.mainsnak.datavalue.value

        ob.load('commons', { search: 'insource:' + this.options.template.replace(/\$1/g, id) })
      })

      return false
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromWikidata(options)
