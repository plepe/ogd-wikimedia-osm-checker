module.exports = function wikidataSimplify (data) {
  const result = {
    id: data.id
  }

  Object.keys(data.claims).forEach(claimId => {
    result[claimId] = data.claims[claimId].map(claim => {
      const snak = claim.mainsnak

      switch (snak.datatype) {
        case 'wikibase-item':
          return { value: snak.datavalue.value.id, title: claim.text, type: 'item' }
        case 'globe-coordinate':
          return { value: snak.datavalue.value, type: 'coordinates' }
        case 'commonsMedia':
        case 'external-id':
          return { value: snak.datavalue.value, type: 'string' }
        case 'monolingualtext':
          return { value: snak.datavalue.value.text, type: 'string', language: snak.datavalue.value.language }
        default:
          return { value: snak.datavalue.value }
      }
    })
  })

  return result
}
