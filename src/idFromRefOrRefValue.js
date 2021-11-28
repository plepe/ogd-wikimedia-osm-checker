/**
 * possible results:
 * false -> refValue should be loaded, but not ready yet
 * null -> refValue should be loaded, but not existant at ref object
 * other -> final result
 */
module.exports = function idFromRefOrRefValue (ob, refValue) {
  let id = ob.id
  if (refValue) {
    if (!ob.data.wikidata || !ob.data.wikidata.length) {
      return false
    }

    const data = ob.data.wikidata[0].claims[refValue.wikidataProperty]
    if (!data || !data.length) {
      id = null
    } else {
      id = data[0].mainsnak.datavalue.value
    }
  }

  return id
}
