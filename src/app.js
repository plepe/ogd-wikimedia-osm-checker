const async = require('async')
const hash = require('sheet-router/hash')

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

  let a = document.createElement('a')
  a.appendChild(document.createTextNode(entry.Bezeichnung))
  a.href = '#' + entry.ObjektID
  td.appendChild(a)
  td.appendChild(document.createElement('br'))

  document.getElementById("data").appendChild(tr)
}

window.onload = () => {
  document.body.classList.add('loading')
  async.parallel([
    done => {
      fetch('data/bda.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => {
            data[entry.ObjektID] = entry
            KGs[entry.KG] = true
          })

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

    document.body.classList.remove('loading')

    select.onchange = update
    if (location.hash) {
      choose(location.hash.substr(1))
    } else {
      update()
    }

    hash(loc => {
      choose(loc.substr(1))
    })
  })
}

function choose (id) {
  if (!(id in data)) {
    return alert(id + " nicht gefunden!")
  }

  let select = document.getElementById('KG')
  let KG = data[id].KG
  select.value = KG
  update()

  check(id)
}

function update () {
  let select = document.getElementById('KG')
  let KG = select.value

  let table = document.getElementById('data')
  while (table.rows.length > 1) {
    table.removeChild(table.rows[1])
  }

  for (let k in data) {
    if (data[k].KG === KG) {
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
  showBDA(entry, div)
  async.each(checker,
    (module, done) => module(id, div, done),
    (err) => { document.body.classList.remove('loading') }
  )
}
