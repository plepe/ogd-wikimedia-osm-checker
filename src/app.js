const async = require('async')
const hash = require('sheet-router/hash')
const escHTML = require('html-escape')
const natsort = require('natsort').default

const runChecks = require('./runChecks.js')
const Examinee = require('./Examinee.js')

const showBDA = require('./showBDA.js')

const data = {}
let ortFilter = {}
let info

function show (k) {
  const entry = data[k]

  const tr = document.createElement('tr')
  const td = document.createElement('td')
  tr.appendChild(td)

  const a = document.createElement('a')
  a.innerHTML = '<span class="Bezeichnung">' + escHTML(entry.Bezeichnung) + '</span><span class="Adresse">' + escHTML(entry.Adresse) + '</span>'
  a.href = '#' + entry.ObjektID
  td.appendChild(a)
  td.appendChild(document.createElement('br'))

  document.getElementById('data').appendChild(tr)
}

window.onload = () => {
  info = document.getElementById('content').innerHTML

  document.body.classList.add('loading')
  async.parallel([
    done => {
      global.fetch('data/bda.json')
        .then(res => {
          if (!res.ok) {
            throw Error('loading BDA data: ' + res.statusText)
          }

          return res.json()
        })
        .then(json => {
          json.forEach(entry => {
            data[entry.ObjektID] = entry
            ortFilter[entry.Gemeinde] = true
          })

          done()
        })
        // .catch(e => done(e))
    }
  ],
  err => {
    document.body.classList.remove('loading')
    if (err) {
      return global.alert(err)
    }

    const select = document.getElementById('Ortfilter')
    ortFilter = Object.keys(ortFilter)
    ortFilter = ortFilter.sort(natsort({ insensitive: true }))
    ortFilter.forEach(ort => {
      const option = document.createElement('option')
      option.appendChild(document.createTextNode(ort))
      select.appendChild(option)
    })

    select.onchange = update
    if (global.location.hash) {
      choose(global.location.hash.substr(1))
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
    return global.alert(id + ' nicht gefunden!')
  }

  const select = document.getElementById('Ortfilter')
  const ort = data[id].Gemeinde
  select.value = ort
  update()

  check(id)
}

function update () {
  const select = document.getElementById('Ortfilter')
  const ort = select.value

  const content = document.getElementById('content')
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  if (ort === '') {
    content.innerHTML = info
    return
  }

  const table = document.createElement('table')
  table.id = 'data'
  table.innerHTML = '<tr><th>Denkmal aus Bundesdenkmalamtsliste</th></tr>'
  content.appendChild(table)

  for (const k in data) {
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

  document.body.classList.add('loading')
  showBDA(entry, div)

  const ob = new Examinee(entry.ObjektID, entry)
  runChecks(ob, (err, result) => {
    if (err) { global.alert(err) }

    document.body.classList.remove('loading')
  })
}
