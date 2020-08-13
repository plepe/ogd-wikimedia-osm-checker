const getCoords = require('./getCoords.js')

module.exports = function getAllCoords (ob) {
  const allCoords = []

  if (ob.dataset.coordField) {
    const coords = getCoords(ob.refData, ob.dataset.coordField)
    if (coords) {
      allCoords.push(coords)
    }
  }

  ob.data.wikidata.forEach(
    wikidata => {
      if (wikidata.claims.P625) {
        wikidata.claims.P625.forEach(
          P625 => {
            allCoords.push(P625.mainsnak.datavalue.value)
          }
        )
      }
    }
  )

  return allCoords
}
