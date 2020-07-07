const STATUS = require('../src/status.js')

const recommendedReferences = {
  P84: 'Architekt_in',
  P170: 'Urheber_in',
  P186: 'Material',
  P580: 'Startzeitpunkt',
  P417: 'Patron_in',
  P180: 'Motiv',
  P7842: 'Wien Geschichte Wiki ID'
}

module.exports = function init (options) {
  return check.bind(this, options)
}

function check (options, ob) {
  if (!ob.data.wikidata) {
    return // wait for other check to load wikidata
  }

  if (ob.data.wikidata.length === 0) {
    return true // loaded, but no wikidata entry found
  }

  const el = ob.data.wikidata[0]

  const recommendations = []
  for (const k in recommendedReferences) {
    if (!(k in el.claims)) {
      recommendations.push(recommendedReferences[k])
    }
  }

  if (recommendations.length) {
    return ob.message('wikidata', STATUS.WARNING, 'Empfohlene weitere Angaben: ' + recommendations.join(', '))
  }
}
