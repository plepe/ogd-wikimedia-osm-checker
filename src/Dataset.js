const escHTML = require('html-escape')
const natsort = require('natsort').default
const twig = require('twig').twig
const async = require('async')

const Examinee = require('./Examinee')
const get = require('./get')
const renderTemplate = require('./renderTemplate')
const loadFile = require('./loadFile')
const datasetsList = require('./datasetsList')

const datasets = {}

const defaultsTemplates = {
  listFieldTitle: '{{ id }}'
}

class Dataset {
  constructor (id, data = {}) {
    this.id = id
    datasets[id] = this

    this.refData = {}
    for (const k in data) {
      this[k] = data[k]
    }

    this.templates = {}
    this.examinees = {}
  }

  compileOverpassQuery (ob) {
    if (!ob.dataset.osm || !ob.dataset.osm.query) {
      return null
    }

    let result = renderTemplate(ob.dataset.osm.query, ob.templateData())

    result = result.map(line => {
      if (!line.trim()) {
        return null
      }

      const m1 = line.match(/^(.*)\((.*)\)$/)
      if (m1) {
        return line + ';'
      }

      return line + '(distance:50);'
    }).filter(f => f)

    if (result.length) {
      return '(' + result.join('') + ');'
    }

    return null
  }

  osmRecommendTags (ob, osmItem) {
    if (!ob.dataset.osm || !ob.dataset.osm.recommendTags) {
      return []
    }

    const templateData = ob.templateData()
    if (osmItem) {
      templateData.osmItem = osmItem
    }

    // add empty lines, to avoid that twig merges lines between expressions
    return renderTemplate(ob.dataset.osm.recommendTags, templateData)
  }

  osmAddTags (ob, osmItem) {
    if (!ob.dataset.osm || !ob.dataset.osm.addTags) {
      return {}
    }

    const templateData = ob.templateData()
    if (osmItem) {
      templateData.osmItem = osmItem
    }

    const compiledTags = {}
    renderTemplate(ob.dataset.osm.addTags, templateData)
      .forEach(line => {
        const m = line.match(/^([^=]+)=(.*)$/)
        if (m) {
          compiledTags[m[1]] = m[2]
        }
      })

    return compiledTags
  }

  wikidataRecommendProperties (ob) {
    if (!ob.dataset.wikidata || !ob.dataset.wikidata.recommendProperties) {
      return []
    }

    return renderTemplate(ob.dataset.wikidata.recommendProperties, ob.templateData())
  }

  getValues (key, callback) {
    get.values(this, key, (err, values) => callback(err, values, this.fileStat))
  }

  getItems (options = {}, callback) {
    get.items(this, options, (err, data) => callback(err, data, this.fileStat))
  }

  getExaminees (options = {}, callback) {
    this.getItems(options, (err, items) => {
      if (err) { return callback(err) }

      const list = items.map((item, index) => {
        const id = this.refData.idField ? item[this.refData.idField] : index

        if (id in this.examinees) {
          return this.examinees[id]
        }

        this.examinees[id] = new Examinee(id, item, this)
        return this.examinees[id]
      })

      callback(null, list)
    })
  }

  getItem (id, callback) {
    get.item(this, id, (err, item, stat) => {
      callback(err, item, stat)
    })
  }

  getExaminee (id, callback) {
    if (id in this.examinees) {
      return callback(null, this.examinees[id])
    }

    this.getItem(id, (err, item) => {
      if (err) { return callback(err) }

      this.examinees[id] = new Examinee(id, item, this)
      callback(null, this.examinees[id])
    })
  }

  showInfo (content) {
    let text = '<h1>' + (this.titleLong || this.title) + '</h1>'

    if (this.ogdInfo) {
      text += '<p>' + this.ogdInfo + '</p>'
    }

    if (this.ogdURL) {
      text += '<p><a target="_blank" href="' + escHTML(this.ogdURL) + '">Info</a></p>'
    }

    content.innerHTML = text
  }

  getFilter (callback) {
    let def = {}

    if (this.refData.filter) {
      def = this.refData.filter
    } else if (this.refData.placeFilterField) {
      def[this.refData.placeFilterField] = {
        type: 'select',
        name: 'Ort',
        valuesField: this.refData.placeFilterField
      }
    }

    async.each(
      def,
      (d, done) => {
        if (!d.valuesField) {
          return done()
        }

        this.getValues(d.valuesField, (err, values) => {
          d.values = values
          delete d.valuesField

          done()
        })
      },
      (err) => {
        callback(err, def)
      }
    )
  }

  template (id) {
    if (!(id in this.templates)) {
      let data = defaultsTemplates[id]

      if (id in this.refData) {
        data = (this.refData[id] && this.refData[id].match(/\{/)) ? this.refData[id] : ('{{ item.' + this.refData[id] + ' }}')
      }

      this.templates[id] = twig({ data, autoescape: true })
    }

    return this.templates[id]
  }
}

Dataset.get = function (id, callback) {
  if (id in datasets) {
    return callback(null, datasets[id])
  }

  datasetsList({id},
    (err, def) => {
      // do not load dataset, if it already has been loaded in the meantime ...
      if (!(id in datasets)) {
        new Dataset(id, def)
      }

      callback(null, datasets[id])
    }
  )
}

let list
Dataset.list = function (callback) {
  if (list) {
    return callback(null, list)
  }

  datasetsList({withContent: true}, (err, _list) => {
    if (err) { return callback(err) }

    list = _list.map(d => {
      if (!(d.id in datasets)) {
        new Dataset(d.id, d)
      }

      return d.id
    })
    callback(null, list)
  })
}

module.exports = Dataset
