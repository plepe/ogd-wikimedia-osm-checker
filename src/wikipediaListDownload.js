const async = require('async')
const fs = require('fs')
const WikipediaListExtractor = require('wikipedia-list-extractor')

function modify (data) {
  data.forEach(d => {
    const rendered = d.rendered
    delete d.rendered

    for (let k in rendered) {
      d[k] = rendered[k]
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
  
  if (dataset.source.pages) {
    async.each(dataset.source.pages,
      (page, done) => {
        list.getPageItems(page, {}, (err, data) => {
          data = modify(data)
          result = result.concat(data)
          done()
        })
      },
      (err, result) => save(dataset, err, result, callback)
    )
  } else {
    list.getAll({}, (err, result) => {
      if (err) { return callback(err) }
      result = modify(result)
      save(dataset, null, result, callback)
    })
  }
}
