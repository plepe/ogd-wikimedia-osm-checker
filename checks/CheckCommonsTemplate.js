const parseMediawikiTemplate = require('parse-mediawiki-template')
const STATUS = require('../src/status.js')
const Check = require('../src/Check.js')

class CheckCommonsTemplate extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
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
    if (this.options && this.options.wikidataValueProperty) {
      if (!ob.data.wikidata || !ob.data.wikidata.length) {
        return true
      }

      const data = ob.data.wikidata[0].claims[this.options.wikidataValueProperty]
      if (!data || !data.length) {
        return true
      }

      id = data[0].mainsnak.datavalue.value
    }

    let categoriesWithTemplateID = categories.filter(el => {
      if (!el.title.match(/Category:/)) {
        return false
      }

      const templates = parseMediawikiTemplate(el.wikitext, ob.dataset.commonsTemplateRegexp)
      return !!templates.filter(r => r[1] === id).length
    })

    if (categoriesWithTemplateID.length) {
      ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Referenz auf Datensatz.')
    } else {
      ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Referenz zu Datensatz. Füge <tt>' + ob.dataset.commonsTemplate.replace(/\$1/g, id) + '</tt> hinzu.')
    }

    return true
  }
}

module.exports = options => new CheckCommonsTemplate(options)
