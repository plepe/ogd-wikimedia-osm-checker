const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  let wikidataId

  if (!ob.data.wikidata) {
    return
  }

  if (ob.data.wikidata.length === 0) {
    return true
  }

  const el = ob.data.wikidata[0]
  if (el.claims.P373) {
    const data = el.claims.P373
    ob.load('commons', { title: 'Category:' + data[0].mainsnak.datavalue.value })
  }

  return true
}
