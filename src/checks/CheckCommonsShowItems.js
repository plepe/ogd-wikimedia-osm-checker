const twig = require('twig').twig
const escHTML = require('html-escape')

const STATUS = require('../status.js')
const Check = require('../Check.js')
const idFromRefOrRefValue = require('../idFromRefOrRefValue')

class CheckCommonsShowItems extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.commons) {
      return
    }

    let id = idFromRefOrRefValue(ob, dataset.commons && dataset.commons.refValue)
    if (id === false || id === null) {
      return true
    }

    if (dataset.commons && dataset.commons.refFormat) {
      if (!dataset.commonsRefFormatTemplate) {
        dataset.commonsRefFormatTemplate = twig({ data: dataset.commons.refFormat })
      }

      id = dataset.commonsRefFormatTemplate.render(ob.templateData())
    }

    const files = ob.data.commons.filter(page => page.title.match(/^File:/))
    const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
    if (files.length) {
      ob.message('commons', STATUS.SUCCESS, files.length + ' Bild(er) gefunden, die auf das Objekt verweisen: ' + files.map((page, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/' + escHTML(page.title) + '">#' + (i + 1) + '</a>').join(', ') + '.')
    }

    if (categories.length) {
      ob.message('commons', STATUS.SUCCESS, categories.length + ' Kategorie(n) gefunden, die auf das Objekt verweisen: ' + categories.map((page, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/' + escHTML(page.title) + '">#' + (i + 1) + '</a>').join(', ') + '.')
    } else {
      if (files.length === 0) {
        ob.message('commons', STATUS.ERROR, 'Weder Bilder noch Kategorien gefunden, die auf dieses Objekt verweisen.' + (dataset.commons && dataset.commons.templateTemplate ? ' Füge <tt>' + dataset.commons.templateTemplate.replace(/\$1/g, id) + '</tt> hinzu.' : ''))
      } else {
        ob.message('commons', STATUS.WARNING, 'Keine Kategorie gefunden, die auf das Objekt verweist.')
      }

      if (!ob.data.wikidata) {
        ob.data.wikidata = []
      }
    }

    return true
  }
}

module.exports = options => new CheckCommonsShowItems(options)
