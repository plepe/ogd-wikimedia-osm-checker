const async = require('async')

const checker = [
  require('./checkWikipedia.js'),
  require('./checkWikidata.js'),
  require('./checkCommons.js'),
  require('./checkOSM.js')
]
const showBDA = require('./showBDA.js')

let data = {}
let KGs = {}

function show (k) {
  let entry = data[k]

  let tr = document.createElement("tr")
  let td

  td = document.createElement("td")
  tr.appendChild(td)

  entry.bda.forEach(d => {
    let a = document.createElement('a')
    a.appendChild(document.createTextNode(d.Bezeichnung))
    a.href = '#' + d.ObjektID
    a.onclick = () => check(d.ObjektID)
    td.appendChild(a)
    td.appendChild(document.createElement('br'))
  })

  document.getElementById("data").appendChild(tr)
}

function add (type, id, entry) {
  if (!(id in data)) {
    data[id] = {
      bda: [],
      wikidata: [],
      osm: [],
      wmc: []
    }
  }

  data[id][type].push(entry)
}

window.onload = () => {
  document.body.classList.add('loading')
  async.parallel([
    done => {
      fetch('data/bda.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => {
            add('bda', entry.ObjektID, entry)
            KGs[entry.KG] = true
          })

          done()
        })
    },
    done => {
      fetch('data/wikidata.json')
        .then(res => res.json())
        .then(json => {
          json.results.bindings.forEach(entry => add('wikidata', entry.ID.value, entry))

          done()
        })
    },
    done => {
      fetch('data/overpass.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => add('osm', entry.tags["ref:at:bda"], entry))

          done()
        })
    },
    done => {
      fetch('data/wikimedia_commons.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => add('wmc', entry.id, entry))

          done()
        })
    }
  ],
  err => {
    let select = document.getElementById('KG')
    KGs = Object.keys(KGs)
    KGs = KGs.sort()
    KGs.forEach(KG => {
      let option = document.createElement('option')
      option.appendChild(document.createTextNode(KG))
      select.appendChild(option)
    })

    select.onchange = update
    update()

    document.body.classList.remove('loading')
  })
}

function update () {
  let select = document.getElementById('KG')
  let KG = select.value

  let table = document.getElementById('data')
  while (table.rows.length > 1) {
    table.removeChild(table.rows[1])
  }

  for (let k in data) {
    if (data[k].bda.length && data[k].bda[0].KG === KG) {
      show(k)
    }
  }
}

function check (id) {
  const entry = data[id]
  const div = document.getElementById('details')

  while (div.firstChild) {
    div.removeChild(div.firstChild)
  }

  // Load OSM data
  document.body.classList.add('loading')
  showBDA(entry.bda[0], div)
  async.each(checker,
    (module, done) => module(id, div, done),
    (err) => { document.body.classList.remove('loading') }
  )
}
