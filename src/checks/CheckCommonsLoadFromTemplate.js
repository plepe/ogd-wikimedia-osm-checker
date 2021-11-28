const twig = require('twig').twig

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

    let id = idFromRefOrRefValue(ob, dataset.commons.refValue)
    if (id === false || id === null) {
      return true
    }

    if (dataset.commons.refFormat) {
      if (!dataset.commonsRefFormatTemplate) {
        dataset.commonsRefFormatTemplate = twig({ data: dataset.commons.refFormat })
      }

      id = dataset.commonsRefFormatTemplate.render(ob.templateData())
    }

    if (!ob.data.commons) {
      return ob.load('commons', { search: 'insource:' + dataset.commons.searchRegexp.replace(/\$1/g, id) })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
