const hash = require('sheet-router/hash')
const escHTML = require('html-escape')
const forEach = require('foreach')
const async = require('async')
const Events = require('eventemitter2')

const Dataset = require('./Dataset.js')
const Examinee = require('./Examinee.js')
const httpRequest = require('./httpRequest.js')
const timestamp = require('./timestamp')
const loadingIndicator = require('./loadingIndicator')
const showLast = require('./showLast')
const ModulekitForm = require('modulekit-form')

const datasets = {} // deprecated
const modules = [
  require('./news.js'),
  require('./lang.js'),
  require('./wikidataToOsm.js')
]

let dataset
let filter
let ob

let info

class App extends Events {
  constructor () {
    loadingIndicator.start()
    super()

    async.each(modules, (module, done) => module.init(this, done), (err) => {
      loadingIndicator.end()

      if (err) {
        return global.alert(err)
      }

      init()
    })
  }
}

window.onload = () => {
  app = new App()
}

function init () {
  const selectDataset = document.getElementById('Dataset')
  const listDatasets = document.getElementById('datasets')

  Dataset.list((err, list) => {
    async.each(list, (id, done) => {
      Dataset.get(id, (err, dataset) => {
        datasets[id] = dataset // deprecated
        const option = document.createElement('option')
        option.value = id
        option.appendChild(document.createTextNode(dataset.title))
        selectDataset.appendChild(option)

        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = '#' + id
        a.appendChild(document.createTextNode(dataset.titleLong || dataset.title))
        li.appendChild(a)
        listDatasets.appendChild(li)

        done()
      })
    },
    () => {
      info = document.getElementById('content').innerHTML
      init2()
    })
  })
}

function init2 () {
  const selectDataset = document.getElementById('Dataset')
  showLast()

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
  const domFilter = document.getElementById('filter1')
  domFilter.innerHTML = ''

  if (!selectDataset.value) {
    content.innerHTML = info
    showLast()
    return
  }

  dataset = datasets[selectDataset.value]
  ob = null

  dataset.showInfo(document.getElementById('info'))

  loadingIndicator.start()

  dataset.getFilter((err, def) => {
    loadingIndicator.end()

    if (err) { return global.alert(err) }

    filter = new ModulekitForm(
      null,
      def,
      {
        change_on_input: true,
        type: 'form_chooser',
        'button:add_element': 'Filter hinzufügen',
        order: false
      }
    )

    filter.show(domFilter)
    filter.onchange = update

    updateDataset2()
  })
}

function updateDataset2 () {
  if (global.location.hash) {
    choose(global.location.hash.substr(1))
  } else {
    update()
  }
}

function choose (path) {
  const [_dataset, id] = path.split(/\//)

  if (!_dataset && !id) {
    const content = document.getElementById('content')
    content.innerHTML = info
    showLast()
    document.title = 'ogd-wikimedia-osm-checker'
  }

  if (!dataset || (_dataset !== dataset.id)) {
    const selectDataset = document.getElementById('Dataset')
    selectDataset.value = _dataset
    return updateDataset()
  }

  if (!id) {
    const content = document.getElementById('info')
    if (content) {
      dataset.showInfo(content)
    }
    return update()
  }

  loadingIndicator.start()
  dataset.getItem(id, (err, item) => {
    loadingIndicator.end()
    if (err) { return global.alert(id + ' nicht gefunden!') }

    httpRequest('log.cgi?path=' + encodeURIComponent(path), {}, () => {})

    filter.set_data(item)

    update()

    check(id)
  })
}

function update () {
  const content = document.getElementById('content')
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  const table = document.createElement('table')
  table.id = 'data'
  table.innerHTML = '<tr><th>' + escHTML(dataset.title) + '</th></tr>'
  content.appendChild(table)

  const dom = document.getElementById('data')

  const options = {}
  options.filter = filter.get_data()
  for (const k in options.filter) {
    if (options.filter[k] === null) {
      delete options.filter[k]
    }
  }

  loadingIndicator.start()
  dataset.getItems(options, (err, items) => {
    loadingIndicator.end()
    if (err) { return global.alert(err) }

    items.forEach((item, index) => {
      const id = dataset.refData.idField ? item[dataset.refData.idField] : index

      const text = dataset.listFormat(item, index)

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
    })

    selectCurrent()
  })
}

function check (id, options = {}) {
  loadingIndicator.start()
  dataset.getItem(id, (err, entry) => {
    loadingIndicator.end()
    if (err) { return global.alert(err) }

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

    loadingIndicator.start()

    const format = dataset.showFormat(entry)
    if (typeof format === 'string') {
      const dom = document.createElement('div')
      dom.innerHTML = format
      div.appendChild(dom)
    } else {
      div.appendChild(format)
    }

    Array.from(div.getElementsByTagName('a')).forEach(a => {
      if (!a.target) {
        a.target = '_blank'
      }
    })

    ob = new Examinee(id, entry, dataset)
    ob.initMessages(div)
    ob.runChecks(dataset, options, (err, result) => {
      if (err) { global.alert(err) }

      loadingIndicator.end()
    })

    document.title = dataset.title + '/' + ob.id + ' - ogd-wikimedia-osm-checker'

    selectCurrent()
  })
}

function selectCurrent () {
  const table = document.getElementById('data')
  Array.from(table.getElementsByClassName('active')).forEach(d => d.classList.remove('active'))

  if (!dataset || !ob) {
    return
  }

  const listEntry = document.getElementById(dataset.id + '-' + ob.id)
  if (listEntry) {
    listEntry.classList.add('active')
    listEntry.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
