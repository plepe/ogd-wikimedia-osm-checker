const escHTML = require('html-escape')
const twig = require('twig').twig
const EventEmitter = require('events')
const forEach = require('foreach')

const checks = require('./checks/index')
const wikidataSimplify = require('./wikidataSimplify')
const getCoords = require('./getCoords')
const createGeoLink = require('./createGeoLink')
const loader = {
  commons: require('./loader-commons.js'),
  geocoder: require('./loader-geocoder.js'),
  osm: require('./loader-osm.js'),
  wikidata: require('./loader-wikidata.js'),
  wikipedia: require('./loader-wikipedia.js')
}

const modules = {
  geocoder: 'Geocoder (OpenStreetMap Nominatim)',
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

  geometry () {
    return getCoords(this.refData, this.dataset.refData.coordField)
  }

  listFormat () {
    let result = ''
    let template
    let value

    template = this.dataset.template('listFieldTitle')
    if (template) {
      value = template.render(this.templateData())
    }

    result += '<span class="title">' + value + '</span>'

    value = null
    template = this.dataset.template('listFieldAddress')
    if (template) {
      value = template.render(this.templateData())
    }

    if (value) {
      result += '<span class="address">' + value + '</span>'
    }

    return result
  }

  showFormat () {
    let template
    let result = '<h2>' + escHTML(this.dataset.operator) + '</h2>'

    result += '<ul>'

    if (this.dataset.refData.idField || this.dataset.refData.urlFormat) {
      result += '<li class="field-id">'
      if (this.dataset.refData.idField) {
        result += '<span class="label">ID</span>: '
        result += '<span class="value">' + escHTML(this.id) + '</span>'
      }

      template = this.dataset.template('urlFormat')
      if (template) {
        const url = this.dataset.template(this.templateData())

        const urlText = '<a target="_blank" href="' + url + '">Website</a>'
        if (this.dataset.refData.idField) {
          result += ' <span class="url">(' + urlText + ')</span>'
        } else {
          result += '<span class="url">' + urlText + '</span>'
        }
      }

      result += '</li>'
    }

    const showFields = this.dataset.refData.showFields || Object.fromEntries(Object.keys(this.refData).filter(k => !k.match(/^_/)).map(k => [k, {}]))

    Object.keys(showFields).forEach(fieldId => {
      const field = showFields[fieldId] || {}
      let value = this.refData[fieldId]
      if (field.format) {
        if (!field.template) {
          field.template = twig({ data: field.format, autoescape: true })
        }

        value = field.template.render(this.templateData())
      } else {
        value = escHTML(value)
      }

      if (value) {
        result += '<li class="field-' + fieldId + '">'
        result += '<span class="label">' + escHTML(field.title || fieldId) + '</span>: '
        result += '<span class="value">' + value + '</span>'
        result += '</li>'
      }
    })

    if (this.dataset.refData.coordField) {
      let text = '<li class="field-coords">'
      text += '<span class="label">Koordinaten</span>: '
      text += '<span class="value">' + createGeoLink(this.refData, this.dataset.refData.coordField) + '</span>'
      text += '</li>'

      result += text
    }

    result += '</ul>'

    return result
  }


  initMessages (dom) {
    this.messagesDiv = {}

    forEach(modules, (title, id) => {
      const div = document.createElement('div')
      dom.appendChild(div)

      this.messagesDiv[id] = div
    })
  }

  clearMessages () {
    forEach(this.messagesDiv,
      div => { div.innerHTML = '' }
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

  /**
   * Like load(), but returns an actual result
   * @return undefined or the actual result
   */
  loadResult (module, query) {
    if (this.load(module, query)) {
      return loader[module].cached(query)
    }

    return undefined
  }

  message (module, status, message) {
    const li = document.createElement('li')
    if (typeof message === 'string') {
      li.innerHTML = message
    } else {
      li.appendChild(message)
    }
    li.className = status

    if (this.messagesDiv[module].innerHTML === '') {
      const div = this.messagesDiv[module]
      div.innerHTML = '<h2>' + modules[module] + '</h2>'

      const ul = document.createElement('ul')
      ul.className = 'check'
      div.appendChild(ul)
    }

    const ul = this.messagesDiv[module].querySelector('ul')
    ul.appendChild(li)

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

  runChecks (options, callback, init = false) {
    if (!init) {
      checks.forEach(check => {
        this.checksStatus[check.id] = false
      })

      this.on('load', () => this.runChecks(options, callback, true))
      this.on('loadError', (err) => {
        this.removeAllListeners()
        callback(err)
      })
    }

    this.clearMessages()

    checks.forEach(check => {
      this.checksStatus[check.id] = check.check(this, this.dataset)
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
      id: this.id,
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
