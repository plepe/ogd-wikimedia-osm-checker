const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
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
      return ob.message('commons', STATUS.SUCCESS, 'Wikidata Eintrag hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(images[0].mainsnak.datavalue.value) + '">Bild</a>')
    }

    return ob.message('commons', STATUS.SUCCESS, 'Wikidata Eintrag hat ' + images.length + ' Bilder: ' + images.map((image, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(image.mainsnak.datavalue.value) + '">#' + (i + 1) + '</a>').join(', '))
  }

  return ob.message('commons', STATUS.WARNING, 'Wikidata Eintrag hat kein Bild')
}
