const async = require('async')
const Dataset = require('./Dataset.js')
const showLast = require('./showLast')

function show () {
  const selector = document.getElementById('selector')
  selector.className = 'viewmode-main-page'

  showLast()
}

function init () {
  const listDatasets = document.getElementById('datasets')

  Dataset.list((err, list) => {
    async.each(list, (id, done) => {
      Dataset.get(id, (err, dataset) => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = '#' + id
        a.appendChild(document.createTextNode(dataset.titleLong || dataset.title))
        li.appendChild(a)
        listDatasets.appendChild(li)

        done()
      })
    })
  })
}

module.exports = {
  init (app, callback) {
    app.on('set-dataset', (dataset) => {
      if (!dataset) {
        show()
      }
    })

    init()
    show()

    callback()
  }
}
