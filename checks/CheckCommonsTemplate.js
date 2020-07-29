const parseMWTemplate = require('../src/parseMWTemplate.js')
const STATUS = require('../src/status.js')
const Check =  require('../src/Check.js')

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

    let categories = ob.data.commons.filter(el => el.title.match(/Category:/))
    if (!categories.length) {
      return true
    }

    let categoriesWithTemplateID = categories.filter(el => {
      if (!el.title.match(/Category:/)) {
        return false
      }

      let templates = parseMWTemplate(el.wikitext, this.options.template)
      return !!templates.filter(r => r[1] === ob.id).length
    })

    if (categoriesWithTemplateID.length) {
      ob.message('commons', STATUS.SUCCESS, 'Commons Kategorie hat Referenz auf Datensatz.')
    } else {
      ob.message('commons', STATUS.ERROR, 'Commons Kategorie hat keine Referenz zu Datensatz. Füge <tt>' + this.options.insert.replace(/\$1/g, ob.id) + '</tt> hinzu.')
    }

    return true
  }
}

module.exports = options => new CheckCommonsTemplate(options)
