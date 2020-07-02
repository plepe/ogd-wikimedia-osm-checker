const escHTML = require('html-escape')

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

  let el = ob.data.wikidata[0]
  if (el.claims.P373) {
    const data = el.claims.P373
    ob.load('commons', data[0].mainsnak.datavalue.value)
    return ob.message('commons', STATUS.SUCCESS, 'Wikidata Eintrag hat Link zu Wikimedia Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + encodeURIComponent(data[0].mainsnak.datavalue.value) + '">' + escHTML(data[0].mainsnak.datavalue.value) + '</a>')
  }

  return ob.message('commons', STATUS.WARNING, 'Wikidata Eintrag hat keinen Link zu Wikimedia Commons Kategorie')
}
