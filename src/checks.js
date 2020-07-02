module.exports = [
  require('../checks/osmRefBda.js')('ref:at:bda'),
  require('../checks/loadWikidata.js')()
]
