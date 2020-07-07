const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.wikidata) {
    return ob.load('wikidata', { key: options, id: ob.id })
  }
}
