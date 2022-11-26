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

const datasets = {} // deprecated
const modules = [
  require('./map'),
  require('./news.js'),
  require('./lang.js'),
  require('./filter.js'),
  require('./view.js'),
  require('./wikidataToOsm.js')
]

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

  update () {
    update()
  }

  updateOptions () {
    if (!this.dataset) {
      return
    }

    loadingIndicator.start()

    this.options = {}
    app.emitAsync('get-items-options', this.options).then(
      () => app.emitAsync('update-options', this.options).then(
        () => {
          loadingIndicator.end()
        },
        (err) => global.alert(err)
      ),
      (err) => global.alert(err)
    )
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

        if (listDatasets) {
          const li = document.createElement('li')
          const a = document.createElement('a')
          a.href = '#' + id
          a.appendChild(document.createTextNode(dataset.titleLong || dataset.title))
          li.appendChild(a)
          listDatasets.appendChild(li)
        }

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
  showLast()

  const selectDataset = document.getElementById('Dataset')
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
    showLast()
    return
  }

  app.dataset = datasets[selectDataset.value]
  ob = null


  //dataset.showInfo(document.getElementById('info'))

  loadingIndicator.start()

  app.emitAsync('set-dataset', app.dataset).then(
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
    app.updateOptions()
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

  if (!app.dataset || (_dataset !== app.dataset.id)) {
    const selectDataset = document.getElementById('Dataset')
    selectDataset.value = _dataset
    return updateDataset()
  }

  if (!id) {
    const content = document.getElementById('info')
    if (content) {
      app.dataset.showInfo(content)
    }
    console.log('here')
    return update()
  }

  loadingIndicator.start()
  app.dataset.getExaminee(id, (err, examinee) => {
    if (err) {
      loadingIndicator.end()

      return global.alert(id + ' nicht gefunden!')
    }

    httpRequest('log.cgi?path=' + encodeURIComponent(path), {}, () => {})

    app.emitAsync('set-examinee', examinee).then(
      () => {

        loadingIndicator.end()

        check(id)
      },
      (err) => global.alert(err)
    )
  })
}

function update () {
  console.log('update')
}

function check (id, options = {}) {
  loadingIndicator.start()
  app.dataset.getExaminee(id, (err, examinee) => {
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
    examinee.runChecks(app.dataset, options, (err, result) => {
      if (err) { global.alert(err) }

      loadingIndicator.end()
    })

    document.title = app.dataset.title + '/' + examinee.id + ' - ogd-wikimedia-osm-checker'
  })
}
