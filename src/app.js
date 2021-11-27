const hash = require('sheet-router/hash')
const escHTML = require('html-escape')
const forEach = require('foreach')
const async = require('async')
const yaml = require('yaml')

const Dataset = require('./Dataset.js')
const Examinee = require('./Examinee.js')
const httpRequest = require('./httpRequest.js')
const timestamp = require('./timestamp')

//const datasets = require('./datasets/index.js')
const _datasets = ['kunstwien']
const datasets = {}
const modules = [
  require('./wikidataToOsm.js')
]

let dataset

let info

window.onload = () => {
  document.body.classList.add('loading')

  async.parallel([
    done => async.each(modules, (module, done) => module.init(done), done),
    done => async.each(_datasets, (id, done) => {
      fetch('datasets/' + id + '.yaml')
        .then(res => res.text())
        .then(body => {
          const d = yaml.parse(body)
          datasets[id] = new Dataset(d)
          done()
        })
    }, done)
  ],
  (err) => {
    document.body.classList.remove('loading')

    if (err) {
      return global.alert(err)
    }

    init()
  })
}

function init () {
  const selectDataset = document.getElementById('Dataset')
  const listDatasets = document.getElementById('datasets')

  forEach(datasets, (_dataset, id) => {
    const option = document.createElement('option')
    option.value = id
    option.appendChild(document.createTextNode(_dataset.title))
    selectDataset.appendChild(option)

    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = '#' + id
    a.appendChild(document.createTextNode(_dataset.titleLong))
    li.appendChild(a)
    listDatasets.appendChild(li)
  })

  info = document.getElementById('content').innerHTML

  selectDataset.onchange = chooseDataset

  if (global.location.hash) {
    choose(global.location.hash.substr(1))
  }

  hash(loc => {
    choose(loc.substr(1))
  })
}

function chooseDataset () {
  const selectDataset = document.getElementById('Dataset')

  global.location.hash = selectDataset.value
  updateDataset()
}

function updateDataset () {
  const content = document.getElementById('content')
  const selectDataset = document.getElementById('Dataset')

  if (!selectDataset.value) {
    content.innerHTML = info
    return
  }

  dataset = datasets[selectDataset.value]

  content.innerHTML = '<h1>' + dataset.titleLong + '</h1><p>' + dataset.ogdInfo + '</p><p><a target="_blank" href="' + escHTML(dataset.ogdURL) + '">Info</a></p>'

  const select = document.getElementById('placeFilter')
  while (select.firstChild.nextSibling) {
    select.removeChild(select.firstChild.nextSibling)
  }

  document.body.classList.add('loading')
  dataset.load((err) => {
    document.body.classList.remove('loading')
    if (err) { global.alert(err) }

    dataset.placeFilter.forEach(place => {
      const option = document.createElement('option')
      option.appendChild(document.createTextNode(place))
      select.appendChild(option)
    })

    select.onchange = update
    if (global.location.hash) {
      choose(global.location.hash.substr(1))
    } else {
      update()
    }
  })
}

function choose (path) {
  const [_dataset, id] = path.split(/\//)

  if (!_dataset && !id) {
    const content = document.getElementById('content')
    content.innerHTML = info
    document.title = 'ogd-wikimedia-osm-checker'
  }

  if (!dataset || (_dataset !== dataset.id)) {
    const selectDataset = document.getElementById('Dataset')
    selectDataset.value = _dataset
    return updateDataset()
  }

  if (!id) {
    return null
  }

  if (!(id in dataset.data)) {
    return global.alert(id + ' nicht gefunden!')
  }

  httpRequest('log.cgi?path=' + encodeURIComponent(path), {}, () => {})

  const select = document.getElementById('placeFilter')
  if (dataset.refData.placeFilterField) {
    const place = dataset.data[id][dataset.refData.placeFilterField]
    select.value = place
  } else {
    select.value = 'alle'
  }
  update()

  check(id)
}

function update () {
  const select = document.getElementById('placeFilter')
  const place = select.value

  const content = document.getElementById('content')
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  if (place === '') {
    content.innerHTML = info
    return
  }

  const table = document.createElement('table')
  table.id = 'data'
  table.innerHTML = '<tr><th>' + escHTML(dataset.title) + '</th></tr>'
  content.appendChild(table)

  const dom = document.getElementById('data')

  Object.keys(dataset.data).forEach(id => {
    const item = dataset.data[id]

    if (!dataset.refData.placeFilterField || item[dataset.refData.placeFilterField] == place) {
      const text = dataset.listFormat(item)

      const tr = document.createElement('tr')
      tr.id = dataset.id + '-' + id

      const td = document.createElement('td')
      tr.appendChild(td)

      const a = document.createElement('a')
      if (typeof text === 'string') {
        a.innerHTML = text
      } else {
        a.appendChild(text)
      }
      a.href = '#' + dataset.id + '/' + id

      td.appendChild(a)
      dom.appendChild(tr)
    }
  })
}

function check (id, options = {}) {
  const entry = dataset.data[id]
  const div = document.getElementById('details')

  while (div.firstChild) {
    div.removeChild(div.firstChild)
  }

  const reload = document.createElement('a')
  reload.href = '#'
  reload.className = 'reload'
  reload.innerHTML = '↻'
  reload.title = 'Nochmal prüfen'
  reload.onclick = () => {
    options.reload = timestamp()
    check(id, options)
    return false
  }
  div.appendChild(reload)

  document.body.classList.add('loading')

  const format = dataset.showFormat(entry)
  if (typeof format === 'string') {
    const dom = document.createElement('div')
    dom.innerHTML = format
    div.appendChild(dom)
  } else {
    div.appendChild(format)
  }

  const ob = new Examinee(entry[dataset.refData.idField], entry, dataset)
  ob.initMessages(div)
  ob.runChecks(dataset, options, (err, result) => {
    if (err) { global.alert(err) }

    document.body.classList.remove('loading')
  })

  document.title = dataset.title + '/' + ob.id + ' - ogd-wikimedia-osm-checker'

  const table = document.getElementById('data')
  Array.from(table.getElementsByClassName('active')).forEach(d => d.classList.remove('active'))

  const listEntry = document.getElementById(dataset.id + '-' + ob.id)
  if (listEntry) {
    listEntry.classList.add('active')
  }
}
