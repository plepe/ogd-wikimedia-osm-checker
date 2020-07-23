const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.wikidata) {
    return ob.load('wikidata', { key: options[0], id: ob.id })
  }

  if (!ob.data.wikidata.length) {
    return ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + options[1] + ' (' + options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
  }

  const success = ob.data.wikidata.filter(
    entry =>
      entry.claims[options[0]] &&
      entry.claims[options[0]].filter(
        claim =>
          claim.mainsnak.datavalue.value === ob.id
      )
  )

  if (success.length) {
    ob.message('wikidata', STATUS.SUCCESS, 'Eintrag mit Attribut <i>' + options[1] + ' (' + options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
  } else {
    ob.message('wikidata', STATUS.ERROR, 'Kein Eintrag mit Attribut <i>' + options[1] + ' (' + options[0] + ')</i> und Wert <i>' + ob.id + '</i> gefunden.')
  }
}
