const fs = require('fs')
const WikipediaListExtractor = require('wikipedia-list-extractor')
const yaml = require('yaml')

const lists = {}
const extractorOptions = { loadRendered: false }

module.exports = function (options, callback) {
  if (!(options.list in lists)) {
    fs.readFile('node_modules/wikipedia-list-extractor/data/' + options.list + '.yaml',
      (err, file) => {
        if (err) { return callback(err) }

        const def = yaml.parse(file.toString())
        lists[options.list] = new WikipediaListExtractor(options.list, def)

        lists[options.list].get(options.id, extractorOptions, callback)
      }
    )

    return
  }

  if (options.reload) {
    lists[options.list].cacheClear(options.id)
  }

  lists[options.list].get(options.id, extractorOptions, callback)
}
