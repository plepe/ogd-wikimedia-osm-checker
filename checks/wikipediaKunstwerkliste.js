const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const parseMWTemplate = require('../src/parseMWTemplate.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  const title = ob.dataset.wikipediaListeTitle(ob)

  if (!ob.data.wikipedia) {
    return ob.load('wikipedia', { title })
  }

  if (ob.data.wikipedia.length === 0) {
    return ob.message('wikipedia', STATUS.ERROR, 'Seite nicht gefunden')
  }

  const listEntries = parseMWTemplate(ob.data.wikipedia[0].wikitext, 'WLPA-AT-Zeile')
  const found = listEntries.filter(e => e.ID === ob.id)

  if (found.length) {
    let msg = '<a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '#id-' + ob.id + '">Wikipedia Liste</a>:<ul>'
    msg += '<li>Beschreibung: ' + escHTML(found[0].Beschreibung) + '</li>'
    msg += '<li>Datierung: ' + escHTML(found[0].Datierung) + '</li>'
    msg += '<li>Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + found[0].Breitengrad + '&mlon=' + found[0].Längengrad + '#map=19/' + found[0].Breitengrad + '/' + found[0].Längengrad + '">' + parseFloat(found[0].Breitengrad).toFixed(5) + ', ' + parseFloat(found[0].Längengrad).toFixed(5) + '</a></li>'
    msg += '</ul>'
    ob.message('wikipedia', STATUS.SUCCESS, msg)

    if (found[0].Foto && found[0].Bilderwunsch) {
      ob.message('wikipedia', STATUS.WARNING, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0].Foto.replace(/ /g, '_')) + '">Bild</a>, aber mit Bilderwunsch: ' + escHTML(found[0].Bilderwunsch))
    } else if (found[0].Foto) {
      ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0].Foto.replace(/ /g, '_')) + '">Bild</a>')
    } else {
      ob.message('wikipedia', STATUS.WARNING, 'Liste hat kein Bild.')
    }

    if (found[0].Commonscat) {
      ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf eine Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + escHTML(found[0].Commonscat.replace(/ /g, '_')) + '">' + escHTML(found[0].Commonscat) + '</a>')
    } else {
      ob.message('wikipedia', STATUS.WARNING, 'Liste hat keinen Verweis auf eine Commons Kategorie.')
    }

    return true
  } else {
    return ob.message('wikipedia', STATUS.ERROR, 'Nicht gefunden in: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '">Wikipedia Liste</a>')
  }
}
