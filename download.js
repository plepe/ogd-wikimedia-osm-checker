const async = require('async')
const fs = require('fs')
const fetch = require('node-fetch')
const yaml = require('yaml')

require('./src/node')

const downloads = require('./src/datasets/downloads')
const standardDownload = require('./src/standardDownload')
const datasetsList = require('./src/datasetsList')
const wikipediaListDownload = require('./src/wikipediaListDownload')
const getUserAgent = require('./src/getUserAgent.js')

function downloadWikidataLists (callback) {
  async.parallel([
    done => {
      fetch('https://query.wikidata.org/sparql',
        {
          method: 'POST',
          body: 'select ?item ?osmTag ?itemLabel where { ?item wdt:P31 wd:Q32880.  ?item wdt:P1282 ?osmTag.  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". } }',
          headers: {
            'Content-Type': 'application/sparql-query',
            'User-Agent': getUserAgent(),
            Accept: 'application/json'
          }
        }
      )
        .then(res => res.json())
        .then(json => {
          const data = {}
          json.results.bindings.forEach(d => {
            const k = d.item.value.match(/\/(Q[0-9]+)$/)[1]
            const v = d.osmTag.value.match(/^(Key|Tag):building:architecture=(.*)$/)
            if (!(k in data) && v) {
              data[k] = {
                tag: v[2],
                name: d.itemLabel.value
              }
            }
          })

          fs.writeFile('data/building_architecture.json', JSON.stringify(data, null, '  '), done)
        })
    }
  ], callback)
}

function listExisting (options = {}, callback) {
  fs.readdir('data/', (err, files) => {
    if (err) { return callback(err) }

    files = files
      .map(file => {
        const m = file.match(/^([^.].*)\.(csv|json|geojson)$/)
        if (m) {
          return m[1]
        }
      })
      .filter(file => file)

    callback(null, files)
  })
}

async.parallel(
  {
    existing: done => listExisting({}, done),
    datasets: done => datasetsList({}, done)
  },
  (err, { existing, datasets }) => {
    if (err) {
      return console.error("Can't read list of datasets:", err.toString())
    }

    const todo = datasets.filter(dataset => !existing.includes(dataset.id))
    downloadDatasets(todo)
  }
)

function downloadDatasets (datasets) {
  async.each(datasets, (_dataset, done) => {
    const id = _dataset.id

    if (id in downloads) {
      return download(downloads[id], id, done)
    }

    const dataset = yaml.parse(fs.readFileSync('./datasets/' + id + '.yaml').toString())
    dataset.id = id

    if (dataset.source) {
      switch (dataset.source.type) {
        case 'wikipedia-list':
          return download((cb) => wikipediaListDownload(dataset, cb), id, done)
        default:
          return download((cb) => standardDownload(dataset, cb), id, done)
      }
    }

    return done()
  })
}

function download (fun, id, callback) {
  fun((err, result) => {
    if (err) {
      console.error('Error downloading', id, err)
    } else {
      console.error('Success downloading', id)
    }
  })
}

downloadWikidataLists(err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
