const twig = require('twig').twig
const parseMediawikiTemplate = require('parse-mediawiki-template')

const STATUS = require('../status.js')
const Check = require('../Check.js')
const idFromRefOrRefValue = require('../idFromRefOrRefValue')

const compileMediawikiTemplate = require('../compileMediawikiTemplate')
const compileMediawikiTemplateParameter = require('../compileMediawikiTemplateParameter')

class CheckCommonsTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.commons || !dataset.commons.template) {
      return true
    }

    if (!ob.data.commons) {
      return false
    }

    if (!ob.data.commons.length) {
      return true
    }

    const categories = ob.data.commons.filter(el => el.title.match(/Category:/))
    if (!categories.length) {
      return true
    }

    if (dataset.commons.template.require) {
      if (dataset.commons.template.require.includes('wikidata') && !ob.data.wikidataSelected) {
        return true
      }
    }

    const template = JSON.parse(JSON.stringify(dataset.commons.template))
    const templateNames = Array.isArray(template.name) ? template.name : [template.name]

    template.parameter = compileMediawikiTemplateParameter(template.parameter, ob.templateData())
    const categoriesWithTemplateID = categories.filter(el => {
      if (!el.title.match(/Category:/)) {
        return false
      }

      const found = templateNames.filter(templateName => {
        const templates = parseMediawikiTemplate(el.wikitext, templateName)

        return !templates.filter(t => {
          template.parameter.filter(p => t[p.name] !== p.value).length
        }).length
      })
      console.log(found)

      return found.length
    })
    
    if (categoriesWithTemplateID.length) {
      ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Referenz auf Datensatz.')
    } else {
      ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Referenz zu Datensatz. Füge <tt>' + compileMediawikiTemplate(dataset.commons.template, ob.templateData()) + '</tt> hinzu.')
    }

    return true
  }
}

module.exports = options => new CheckCommonsTemplate(options)
