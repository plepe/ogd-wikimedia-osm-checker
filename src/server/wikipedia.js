const fs = require('fs')
const WikipediaListExtractor = require('wikipedia-list-extractor')
const yaml = require('yaml')

const lists = {}
const extractorOptions = { loadRendered: false }

module.exports = function (options, callback) {
  if (!(options.list in lists)) {
    lists[options.list] = new WikipediaListExtractor(options.list)
  }

  if (options.reload) {
    lists[options.list].cacheClear(options.id)
  }

  lists[options.list].get(options.id, extractorOptions, callback)
}
