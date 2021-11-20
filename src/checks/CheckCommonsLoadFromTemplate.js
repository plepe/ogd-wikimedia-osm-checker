const Check = require('../Check.js')

class CheckCommonsLoadFromTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    let id = ob.id
    if (ob.dataset.commons.refValue && ob.dataset.commons.refValue.wikidataProperty) {
      if (!ob.data.wikidata || !ob.data.wikidata.length) {
        return true
      }

      const data = ob.data.wikidata[0].claims[ob.dataset.commons.refValue.wikidataProperty]
      if (!data || !data.length) {
        return true
      }

      id = data[0].mainsnak.datavalue.value
    }

    if (!ob.data.commons) {
      return ob.load('commons', { search: 'insource:' + ob.dataset.commons.searchRegexp.replace(/\$1/g, id) })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
