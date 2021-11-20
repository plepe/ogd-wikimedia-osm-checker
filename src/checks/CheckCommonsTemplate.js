const parseMediawikiTemplate = require('parse-mediawiki-template')
const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckCommonsTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.commons) {
      return
    }

    if (!ob.data.commons.length) {
      return true
    }

    const categories = ob.data.commons.filter(el => el.title.match(/Category:/))
    if (!categories.length) {
      return true
    }

    let id = ob.id
    if (dataset.commons.refValue && dataset.commons.refValue.wikidataProperty) {
      if (!ob.data.wikidata || !ob.data.wikidata.length) {
        return true
      }

      const data = ob.data.wikidata[0].claims[dataset.commons.refValue.wikidataProperty]
      if (!data || !data.length) {
        return true
      }

      id = data[0].mainsnak.datavalue.value
    }

    const categoriesWithTemplateID = categories.filter(el => {
      if (!el.title.match(/Category:/)) {
        return false
      }

      const templates = parseMediawikiTemplate(el.wikitext, dataset.commons.templateRegexp)
      return !!templates.filter(r => r[1] === id).length
    })

    if (categoriesWithTemplateID.length) {
      ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Referenz auf Datensatz.')
    } else {
      ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Referenz zu Datensatz. Füge <tt>' + dataset.commons.templateTemplate.replace(/\$1/g, id) + '</tt> hinzu.')
    }

    return true
  }
}

module.exports = options => new CheckCommonsTemplate(options)
