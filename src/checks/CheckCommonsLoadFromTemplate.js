const Check = require('../Check.js')
const idFromRefOrRefValue = require('../idFromRefOrRefValue')

class CheckCommonsLoadFromTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.commons || !dataset.commons.searchRegexp) {
      return true
    }

    const id = idFromRefOrRefValue(ob, dataset.commons.refValue)
    if (id === false || id === null) {
      return true
    }

    if (!ob.data.commons) {
      return ob.load('commons', { search: 'insource:' + dataset.commons.searchRegexp.replace(/\$1/g, id) })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
