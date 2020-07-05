const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const parseMWTemplate = require('../src/parseMWTemplate.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

let bezirke = {
  1010: 'Innere Stadt',
  1020: 'Leopoldstadt',
  1030: 'Landstraße',
  1040: 'Wieden',
  1050: 'Margareten',
  1060: 'Mariahilf',
  1070: 'Neubau',
  1080: 'Josefstadt',
  1090: 'Alsergrund',
  1100: 'Favoriten',
  1110: 'Simmering',
  1120: 'Meidling',
  1130: 'Hietzing',
  1140: 'Penzing',
  1150: 'Rudolfsheim-Fünfhaus',
  1160: 'Ottakring',
  1170: 'Hernals',
  1180: 'Währing',
  1190: 'Döbling',
  1200: 'Brigittenau',
  1210: 'Floridsdorf',
  1220: 'Donaustadt',
  1230: 'Liesing'
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  let title = 'Liste der ' +
    (['Gedenktafeln', 'Gedenksteine'].includes(ob.refData.TYP) ? 'Gedenktafeln und Gedenksteine' : 'Kunstwerke im öffentlichen Raum') +
    ' in Wien/' + bezirke[ob.refData.PLZ]

  if (!ob.data.wikipedia) {
    return ob.load('wikipedia', {title})
  }

  if (ob.data.wikipedia.length === 0) {
    return ob.message('wikipedia', STATUS.ERROR, 'Seite nicht gefunden')
  }

  let listEntries = parseMWTemplate(ob.data.wikipedia[0].wikitext, 'WLPA-AT-Zeile')
  let found = listEntries.filter(e => e.ID === ob.id)
  console.log(found)

  if (found.length) {
    return ob.message('wikipedia', STATUS.SUCCESS, '<a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '">Wikipedia Liste</a>:<br/>' + escHTML(found[0].Beschreibung))
  } else {
    return ob.message('wikipedia', STATUS.ERROR, 'Nicht gefunden in: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '">Wikipedia Liste</a>')
  }
}
