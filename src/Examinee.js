const EventEmitter = require('events')

const loader = {
  osm: require('./loader-osm.js')
}

module.exports = class Examinee extends EventEmitter {
  constructor (id, refData) {
    super()
    this.id = id
    this.refData = refData
    this.data = {}
    this.toLoad = {}
    this.loading = []
    this.doneLoading = {}
  }

  load (module, query) {
    if (!(module in this.toLoad)) {
      this.toLoad[module] = []
    }

    this.toLoad[module].push(query)
  }

  message (module, status, message) {
    global.alert(module + ': ' + status + '/' + message)
    return true
  }

  needLoad () {
    return Object.keys(this.toLoad).length + Object.keys(this.loading).length
  }

  _load () {
    const toLoad = this.toLoad
    this.loading = this.loading.concat(Object.values(this.toLoad))
    this.toLoad = {}

    for (const module in toLoad) {
      if (!(module in this.doneLoading)) {
        this.doneLoading[module] = []
      }

      const queries = toLoad[module].filter(query => !this.doneLoading[module].includes(JSON.stringify(query)))
      queries.forEach(query => this.doneLoading[module].push(JSON.stringify(query)))

      if (!queries.length) {
        this.loading.splice(this.loading.indexOf(toLoad[module]))
        continue
      }

      loader[module](queries,
        (err, result) => {
          this.loading.splice(this.loading.indexOf(toLoad[module]))
          if (err) { return this.emit('loadError', err) }
          this.data[module] = result
          this.emit('load')
        }
      )
    }
  }
}
