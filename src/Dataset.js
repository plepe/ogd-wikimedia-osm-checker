const escHTML = require('html-escape')
const natsort = require('natsort').default
const twig = require('twig').twig

const createGeoLink = require('./createGeoLink')
const load = require('./load')
const renderTemplate = require('./renderTemplate')

class Dataset {
  constructor (data = {}) {
    this.refData = {}

    for (const k in data) {
      this[k] = data[k]
    }
  }

  load (callback) {
    if (this.data) {
      return callback(null)
    }

    if (!this.file) {
      this.file = {}
    }
    if (!this.file.format) {
      this.file.format = 'json'
    }

    if (!this.file.name) {
      this.file.name = this.id + '.' + this.file.format
    }

    const placeFilter = {}
    this.data = {}

    load(this, (err, json) => {
      if (err) { return callback(err) }

      json = this.convertData(json)

      json.forEach((entry, index) => {
        this.data[this.refData.idField ? entry[this.refData.idField] : index] = entry
        placeFilter[entry[this.refData.placeFilterField] || 'alle'] = true
      })

      if (this.refData.placeFilterField) {
        this.placeFilter = Object.keys(placeFilter)
        this.placeFilter = this.placeFilter.sort(natsort({ insensitive: true }))
      } else {
        this.placeFilter = ['alle']
      }

      callback(null)
    })
  }

  listFormat (item, index) {
    let result = ''

    let value = null
    if (!this.refData.listFieldTitle) {
      value = escHTML(this.refData.idField ? item[this.refData.idField] : index)
    } else if (this.refData.listFieldTitle.match(/\{/)) {
      if (!this.listFieldTitleTemplate) {
        this.listFieldTitleTemplate = twig({ data: this.refData.listFieldTitle, autoescape: true })
      }
      value = this.listFieldTitleTemplate.render({ item })
    } else {
      value = escHTML(item[this.refData.listFieldTitle])
    }

    result += '<span class="title">' + value + '</span>'

    if (!this.refData.listFieldAddress) {
      value = null
    } else if (this.refData.listFieldAddress.match(/\{/)) {
      if (!this.listFieldAddressTemplate) {
        this.listFieldAddressTemplate = twig({ data: this.refData.listFieldAddress, autoescape: true })
      }
      value = this.listFieldAddressTemplate.render({ item })
    } else {
      value = escHTML(item[this.refData.listFieldAddress])
    }

    if (value) {
      result += '<span class="address">' + value + '</span>'
    }

    return result
  }

  showFormat (item) {
    let result = '<h2>' + escHTML(this.operator) + '</h2>'

    result += '<ul>'

    if (this.refData.idField || this.refData.urlFormat) {
      result += '<li class="field-id">'
      if (this.refData.idField) {
        result += '<span class="label">ID</span>: '
        result += '<span class="value">' + escHTML(item[this.refData.idField]) + '</span>'
      }

      if (this.refData.urlFormat) {
        if (!this.urlTemplate) {
          this.urlTemplate = twig({ data: this.refData.urlFormat, autoescape: true })
        }

        const urlText = '<a target="_blank" href="' + this.urlTemplate.render({ item }) + '">Website</a>'
        if (this.refData.idField) {
          result += ' <span class="url">(' + urlText + ')</span>'
        } else {
          result += '<span class="url">' + urlText + '</span>'
        }
      }

      result += '</li>'
    }

    const showFields = this.refData.showFields || Object.fromEntries(Object.keys(item).filter(k => !k.match(/^_/)).map(k => [k, {}]))

    Object.keys(showFields).forEach(fieldId => {
      const field = showFields[fieldId] || {}
      let value = item[fieldId]
      if (field.format) {
        if (!field.template) {
          field.template = twig({ data: field.format, autoescape: true })
        }

        value = field.template.render({ item })
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

    if (this.refData.coordField) {
      let text = '<li class="field-coords">'
      text += '<span class="label">Koordinaten</span>: '
      text += '<span class="value">' + createGeoLink(item, this.refData.coordField) + '</span>'
      text += '</li>'

      result += text
    }

    result += '</ul>'

    return result
  }

  convertData (data) {
    if (this.file.format === 'geojson') {
      this.refData.coordField = {
        id: '_geometry',
        type: 'geojson'
      }

      return data.features.map(item => {
        const d = item.properties
        d._geometry = item.geometry
        return d
      })
    }

    return data
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
}

module.exports = Dataset
