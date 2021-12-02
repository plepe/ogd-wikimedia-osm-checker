const Check = require('../Check.js')
const compileMediawikiTemplateSearchRegexp = require('../compileMediawikiTemplateSearchRegexp')
const compileMediawikiTemplateParameter = require('../compileMediawikiTemplateParameter')

class CheckCommonsLoadFromTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.commons || !dataset.commons.template) {
      return true
    }

    if (dataset.commons.template) {
      if (dataset.commons.template.require) {
        if (dataset.commons.template.require.includes('wikidata') && !ob.data.wikidataSelected) {
          return true
        }
      }

      const template = JSON.parse(JSON.stringify(dataset.commons.template))
      const templateNames = Array.isArray(template.name) ? template.name : [template.name]

      template.parameter = compileMediawikiTemplateParameter(template.parameter, ob.templateData())
      console.log(template.parameter)

      templateNames.forEach(templateName => {
        template.name = templateName
        const search = compileMediawikiTemplateSearchRegexp(template)
        console.log(search)
        return ob.load('commons', { search })
      })
    }

    return true
  }
}

module.exports = options => new CheckCommonsLoadFromTemplate(options)
