const hash = require('sheet-router/hash')
const forEach = require('foreach')
const async = require('async')
const Events = require('eventemitter2')

const Dataset = require('./Dataset.js')
const Examinee = require('./Examinee.js')
const httpRequest = require('./httpRequest.js')
const timestamp = require('./timestamp')
const loadingIndicator = require('./loadingIndicator')
const showLast = require('./showLast')
const viewModes = {
  table: require('./ViewTable'),
  map: require('./ViewMap')
}

const datasets = {} // deprecated
const modules = [
  require('./map'),
  require('./news.js'),
  require('./lang.js'),
  require('./filter.js'),
  require('./wikidataToOsm.js')
]

let dataset
let ob

let info
let currentView

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

  update () {
    update()
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
  document.getElementById('viewMode').onchange = chooseViewMode
  chooseViewMode()

  if (global.location.hash) {
    choose(global.location.hash.substr(1))
  }

  hash(loc => {
    choose(loc.substr(1))
  })
}

function chooseViewMode () {
  const viewMode = document.getElementById('viewMode').value
  const ViewMode = viewModes[viewMode]

  if (currentView) {
    currentView.clear()
  }

  currentView = new ViewMode()

  if (dataset) {
    currentView.setDataset(dataset)
  }

  update()
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
    showLast()
    return
  }

  dataset = datasets[selectDataset.value]
  ob = null

  currentView.setDataset(dataset)

  dataset.showInfo(document.getElementById('info'))

  loadingIndicator.start()

  app.emitAsync('set-dataset', dataset).then(
    () => {
      loadingIndicator.end()

      updateDataset2()
    },
    (err) => global.alert(err)
  )
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
    if (err) {
      loadingIndicator.end()

      return global.alert(id + ' nicht gefunden!')
    }

    httpRequest('log.cgi?path=' + encodeURIComponent(path), {}, () => {})

    app.emitAsync('set-item', item).then(
      () => {
        update()

        loadingIndicator.end()

        check(id)
      },
      (err) => global.alert(err)
    )
  })
}

function update () {
  if (!dataset) {
    return
  }

  const options = {}
  app.emitAsync('get-items-options', options).then(
    () => {
      update2(options)
    },
    (err) => global.alert(err)
  )
}

function update2 (options) {
  loadingIndicator.start()
  dataset.getExaminees(options, (err, examinees) => {
    loadingIndicator.end()
    if (err) { return global.alert(err) }

    currentView.show(examinees)

    selectCurrent()
  })
}

function check (id, options = {}) {
  loadingIndicator.start()
  dataset.getExaminee(id, (err, examinee) => {
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

    const format = examinee.showFormat()
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

    examinee.initMessages(div)
    examinee.runChecks(dataset, options, (err, result) => {
      if (err) { global.alert(err) }

      loadingIndicator.end()
    })

    document.title = dataset.title + '/' + examinee.id + ' - ogd-wikimedia-osm-checker'

    selectCurrent()
  })
}

function selectCurrent () {
  currentView.select(ob)

  if (!dataset || !ob) {
    return
  }
}
