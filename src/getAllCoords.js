const getCoords = require('./getCoords.js')

module.exports = function getAllCoords (ob) {
  const allCoords = []

  if (ob.dataset.refData.coordField) {
    const coords = getCoords(ob.refData, ob.dataset.refData.coordField)
    if (coords) {
      allCoords.push(coords)
    }
  }

  ob.data.wikidata && ob.data.wikidata.forEach(
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

  if (ob.data.wikipedia && ob.data.wikipedia.length && ob.dataset.wikipediaList && ob.dataset.wikipediaList.latitudeField) {
    allCoords.push({
      latitude: parseFloat(ob.data.wikipedia[0][ob.dataset.wikipediaList.latitudeField]),
      longitude: parseFloat(ob.data.wikipedia[0][ob.dataset.wikipediaList.longitudeField])
    })
  }

  return allCoords
}
