const async = require('async')
const hash = require('sheet-router/hash')
const escHTML = require('html-escape')
const natsort = require('natsort').default

const checker = [
  require('./checkWikipedia.js'),
  require('./checkWikidata.js'),
  require('./checkCommons.js'),
  require('./checkOSM.js')
]
const showBDA = require('./showBDA.js')

let data = {}
let ortFilter = {}
let info

function show (k) {
  let entry = data[k]

  let tr = document.createElement("tr")
  let td

  td = document.createElement("td")
  tr.appendChild(td)

  let a = document.createElement('a')
  a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.Bezeichnung) + '</span><span class="Adresse">' + escHTML(entry.Adresse) + '</span>'
  a.href = '#' + entry.ObjektID
  td.appendChild(a)
  td.appendChild(document.createElement('br'))

  document.getElementById("data").appendChild(tr)
}

window.onload = () => {
  info = document.getElementById('content').innerHTML

  document.body.classList.add('loading')
  async.parallel([
    done => {
      fetch('data/bda.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => {
            data[entry.ObjektID] = entry
            ortFilter[entry.Gemeinde] = true
          })

          done()
        })
    }
  ],
  err => {
    let select = document.getElementById('Ortfilter')
    ortFilter = Object.keys(ortFilter)
    ortFilter = ortFilter.sort(natsort({insensitive: true}))
    ortFilter.forEach(ort => {
      let option = document.createElement('option')
      option.appendChild(document.createTextNode(ort))
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

  let select = document.getElementById('Ortfilter')
  let ort = data[id].Gemeinde
  select.value = ort
  update()

  check(id)
}

function update () {
  let select = document.getElementById('Ortfilter')
  let ort = select.value

  let content = document.getElementById('content')
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  if (ort === '') {
    content.innerHTML = info
    return
  }

  let table = document.createElement('table')
  table.id = 'data'
  table.innerHTML = '<tr><th>Denkmal aus Bundesdenkmalamtsliste</th></tr>'
  content.appendChild(table)

  for (let k in data) {
    if (data[k].Gemeinde === ort) {
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
