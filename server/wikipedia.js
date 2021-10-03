const fs = require('fs')
const WikipediaListExtractor = require('wikipedia-list-extractor')

const lists = {}
const extractorOptions = {loadRendered: true}

module.exports = function (options, callback) {
  if (!(options.list in lists)) {
    fs.readFile('node_modules/wikipedia-list-extractor/data/' + options.list + '.json',
      (err, file) => {
        if (err) { return callback(err) }

        const def = JSON.parse(file)
        lists[options.list] = new WikipediaListExtractor(options.list, def)

        lists[options.list].get(options.id, extractorOptions, callback)
      }
    )

    return
  }

  lists[options.list].get(options.id, extractorOptions, callback)
}
