const async = require('async')
const fs = require('fs')
const WikipediaListExtractor = require('wikipedia-list-extractor')

function modify (data, dataset) {
  data.forEach(d => {
    const row = d[dataset.source.parser]
    delete d[dataset.source.parser]

    for (const k in row) {
      d[k] = row[k]
    }
  })

  return data
}

function save (dataset, err, result, callback) {
  if (err) { return callback(err) }

  fs.writeFile('data/' + dataset.id + '.json', JSON.stringify(result), callback)
}

module.exports = function wikipediaListDownload (dataset, callback) {
  const list = new WikipediaListExtractor(dataset.source.list)
  let result = []

  const options = {}
  if (dataset.source.parser === 'rendered') {
    options.loadRaw = false
  } else {
    dataset.source.parser = 'raw'
    options.loadRendered = false
  }

  if (dataset.source.pages) {
    async.each(dataset.source.pages,
      (page, done) => {
        list.getPageItems(page, options, (err, data) => {
          data = modify(data, dataset)
          result = result.concat(data)
          done()
        })
      },
      (err, result) => save(dataset, err, result, callback)
    )
  } else {
    list.getAll(options, (err, result) => {
      if (err) { return callback(err) }
      result = modify(result, dataset)
      save(dataset, null, result, callback)
    })
  }
}
