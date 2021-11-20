const escHTML = require('html-escape')

const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckCommonsShowItems extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.commons) {
      return
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
        ob.message('commons', STATUS.ERROR, 'Weder Bilder noch Kategorien gefunden, die auf dieses Objekt verweisen. Füge <tt>' + ob.dataset.commonsTemplate.replace(/\$1/g, ob.id) + '</tt> hinzu.')
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
