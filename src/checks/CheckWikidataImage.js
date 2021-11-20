const escHTML = require('html-escape')

const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataImage extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return
    }

    if (ob.data.wikidata.length === 0) {
      return true
    }

    // image
    const el = ob.data.wikidata[0]
    if (el.claims.P18) {
      const images = el.claims.P18
      if (images.length === 1) {
        ob.message('wikidata', STATUS.SUCCESS, 'Eintrag hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(images[0].mainsnak.datavalue.value) + '">Bild</a>')
      } else {
        ob.message('wikidata', STATUS.SUCCESS, 'Eintrag hat ' + images.length + ' Bilder: ' + images.map((image, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(image.mainsnak.datavalue.value) + '">#' + (i + 1) + '</a>').join(', '))
      }
    } else {
      ob.message('wikidata', STATUS.WARNING, 'Eintrag hat kein Bild')
    }

    if (el.claims.P373) {
      const data = el.claims.P373
      return ob.message('wikidata', STATUS.SUCCESS, 'Eintrag hat Link zur Wikimedia Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + encodeURIComponent(data[0].mainsnak.datavalue.value) + '">' + escHTML(data[0].mainsnak.datavalue.value) + '</a>')
    }

    return ob.message('wikidata', STATUS.WARNING, 'Eintrag hat keinen Link zu einer Wikimedia Commons Kategorie')
  }
}

module.exports = options => new CheckWikidataImage(options)
