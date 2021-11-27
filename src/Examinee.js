const EventEmitter = require('events')
const forEach = require('foreach')

const checks = require('./checks/index')
const wikidataSimplify = require('./wikidataSimplify')
const loader = {
  commons: require('./loader-commons.js'),
  osm: require('./loader-osm.js'),
  wikidata: require('./loader-wikidata.js'),
  wikipedia: require('./loader-wikipedia.js')
}

const modules = {
  wikipedia: 'Wikipedia',
  wikidata: 'Wikidata',
  commons: 'Wikimedia Commons',
  osm: 'OpenStreetMap'
}

module.exports = class Examinee extends EventEmitter {
  constructor (id, refData, dataset) {
    super()
    this.id = id
    this.refData = refData
    this.dataset = dataset
    this.data = {}
    this.toLoad = {}
    this.loading = {}
    this.doneLoading = {}
    this.checksStatus = {}
  }

  initMessages (dom) {
    this.messagesUl = {}

    forEach(modules, (title, id) => {
      const div = document.createElement('div')
      dom.appendChild(div)

      div.innerHTML = '<h2>' + title + '</h2>'

      const ul = document.createElement('ul')
      ul.className = 'check'
      div.appendChild(ul)
      this.messagesUl[id] = ul
    })
  }

  clearMessages () {
    forEach(this.messagesUl,
      ul => { ul.innerHTML = '' }
    )
  }

  /**
   * @return return true if query has already been loaded
   */
  load (module, query) {
    const queryId = JSON.stringify(query)

    if (module in this.doneLoading && this.doneLoading[module].includes(queryId)) {
      return true
    }

    if (module in this.loading && this.loading[module].includes(queryId)) {
      return false
    }

    if (module in this.toLoad && this.toLoad[module].includes(queryId)) {
      return false
    }

    if (!(module in this.toLoad)) {
      this.toLoad[module] = []
    }

    this.toLoad[module].push(query)
    return false
  }

  message (module, status, message) {
    const li = document.createElement('li')
    if (typeof message === 'string') {
      li.innerHTML = message
    } else {
      li.appendChild(message)
    }
    li.className = status
    this.messagesUl[module].appendChild(li)

    return true
  }

  needLoad () {
    return Object.keys(this.toLoad).length + Object.keys(this.loading).length
  }

  _load (options) {
    const toLoad = this.toLoad
    this.toLoad = {}

    for (const module in toLoad) {
      if (!(module in this.doneLoading)) {
        this.doneLoading[module] = []
      }

      const queries = toLoad[module]

      if (!(module in this.loading)) {
        this.loading[module] = []
      }

      queries.forEach(query => this.loading[module].push(JSON.stringify(query)))

      loader[module].load(queries,
        options,
        (err, result) => {
          queries.forEach(query => {
            this.loading[module].splice(this.loading[module].indexOf(JSON.stringify(query)), 1)
            this.doneLoading[module].push(JSON.stringify(query))
          })

          if (this.loading[module].length === 0) {
            delete this.loading[module]
          }

          if (err) { return this.emit('loadError', err) }

          if (!(module in this.data)) {
            this.data[module] = []
          }

          result.forEach(e => {
            if (!loader[module].includes(this.data[module], e)) {
              this.data[module].push(e)
            }
          })

          this.emit('load')
        }
      )
    }
  }

  runChecks (dataset, options, callback, init = false) {
    if (!init) {
      checks.forEach(check => {
        this.checksStatus[check.id] = false
      })

      this.on('load', () => this.runChecks(dataset, options, callback, true))
      this.on('loadError', (err) => {
        this.removeAllListeners()
        callback(err)
      })
    }

    this.clearMessages()

    checks.forEach(check => {
      this.checksStatus[check.id] = check.check(this, dataset)
    })

    if (this.needLoad()) {
      this._load(options)
    } else {
      this.removeAllListeners()
      callback(null)
    }
  }

  /**
   * return true if the check with the name has been finished (or is not added to the dataset. if checkId is a regular expression, check if all checks with a matching id are done.
   */
  isDone (checkId) {
    if (checkId instanceof RegExp) {
      for (const k in this.checksStatus) {
        if (k.match(checkId) && !this.checksStatus[k]) {
          return false
        }
      }

      return true
    }

    if (!(checkId in this.checksStatus)) {
      return true
    }

    return this.checksStatus[checkId]
  }

  templateData () {
    const result = {
      item: this.refData
    }

    if (this.data.wikipedia && this.data.wikipedia.length) {
      result.wikipediaList = this.data.wikipedia[0]
    }

    if (this.data.wikidataSelected) {
      result.wikidata = wikidataSimplify(this.data.wikidataSelected)
    }

    return result
  }
}
