const hash = require('sheet-router/hash')
const escHTML = require('html-escape')
const forEach = require('foreach')

const runChecks = require('./runChecks.js')
const Examinee = require('./Examinee.js')

const datasets = require('../datasets/index.js')
let dataset

let info

window.onload = () => {
  info = document.getElementById('content').innerHTML

  let selectDataset = document.getElementById('Dataset')
  forEach(datasets, (_dataset, id) => {
    let option = document.createElement('option')
    option.value = id
    option.appendChild(document.createTextNode(_dataset.title))

    selectDataset.appendChild(option)
  })

  selectDataset.onchange = chooseDataset

  if (global.location.hash) {
    choose(global.location.hash.substr(1))
  }
}

function chooseDataset () {
  let selectDataset = document.getElementById('Dataset')

  location.hash = selectDataset.value
  updateDataset()
}

function updateDataset () {
  let selectDataset = document.getElementById('Dataset')

  if (!selectDataset.value) {
    content.innerHTML = info
    return
  }

  dataset = datasets[selectDataset.value]

  const select = document.getElementById('Ortfilter')
  while (select.firstChild.nextSibling) {
    select.removeChild(select.firstChild.nextSibling)
  }

  document.body.classList.add('loading')
  dataset.load((err) => {
    document.body.classList.remove('loading')
    if (err) { global.alert(err) }

    dataset.ortFilter.forEach(ort => {
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

function choose (path) {
  let [_dataset, id] = path.split(/\//)

  if (!dataset || _dataset !== dataset.id) {
    content.innerHTML = info

    let selectDataset = document.getElementById('Dataset')
    selectDataset.value = _dataset
    return updateDataset()
  }

  if (!id) {
    content.innerHTML = info
    return
  }

  if (!(id in dataset.data)) {
    return global.alert(id + ' nicht gefunden!')
  }

  const select = document.getElementById('Ortfilter')
  const ort = dataset.data[id][dataset.ortFilterField]
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
  table.innerHTML = '<tr><th>' + escHTML(dataset.listTitle) + '</th></tr>'
  content.appendChild(table)

  let dom = document.getElementById('data')

  for (const k in dataset.data) {
    if (dataset.data[k][dataset.ortFilterField] === ort) {
      dataset.listEntry(dataset.data[k], dom)
    }
  }
}

function check (id) {
  const entry = dataset.data[id]
  const div = document.getElementById('details')

  while (div.firstChild) {
    div.removeChild(div.firstChild)
  }

  document.body.classList.add('loading')
  dataset.showEntry(entry, div)

  const ob = new Examinee(entry[dataset.idField], entry)
  ob.initMessages(div)
  runChecks(ob, dataset.checks, (err, result) => {
    if (err) { global.alert(err) }

    document.body.classList.remove('loading')
  })
}
