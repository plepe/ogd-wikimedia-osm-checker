const escHTML = require('html-escape')
const natsort = require('natsort').default
const twig = require('twig').twig

const createGeoLink = require('./createGeoLink')
const load = require('./load')

class Dataset {
  constructor (data = {}) {
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

      json.forEach(entry => {
        this.data[entry[this.refData.idField]] = entry
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

  listFormat (item) {
    let result = ''

    let value = null
    if (!this.refData.listFieldTitle) {
      value = escHTML(item[this.refData.idField])
    } else if (this.refData.listFieldTitle.match(/\{/)) {
      if (!this.listFieldTitleTemplate) {
        this.listFieldTitleTemplate = twig({ data: this.refData.listFieldTitle })
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
        this.listFieldAddressTemplate = twig({ data: this.refData.listFieldAddress })
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

    result += '<li class="field-id">'
    result += '<span class="label">ID</span>: '
    result += '<span class="value">' + escHTML(item[this.refData.idField]) + '</span>'

    if (this.refData.urlFormat) {
      if (!this.urlTemplate) {
        this.urlTemplate = twig({ data: this.refData.urlFormat })
      }

      result += ' <span class="url">(<a target="_blank" href="' + this.urlTemplate.render({ item }) + '">Website</a>)</span>'
    }

    result += '</li>'

    const showFields = this.refData.showFields || Object.fromEntries(Object.keys(item).filter(k => !k.match(/^_/)).map(k => [k, {}]))

    Object.keys(showFields).forEach(fieldId => {
      const field = showFields[fieldId] || {}
      let value = item[fieldId]
      if (field.format) {
        if (!field.template) {
          field.template = twig({ data: field.format })
        }

        value = field.template.render({ item })
      }

      if (value) {
        result += '<li class="field-' + fieldId + '">'
        result += '<span class="label">' + escHTML(field.title || fieldId) + '</span>: '
        result += '<span class="value">' + escHTML(value) + '</span>'
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

    if (!this.osmCompileQueryTemplate) {
      // add empty lines, to avoid that twig merges lines between expressions
      this.osmCompileQueryTemplate = twig({ data: ob.dataset.osm.query.replace(/\n/g, '\n\n') })
    }

    let result = this.osmCompileQueryTemplate.render(ob.templateData())

    result = result.split(/\n/g).map(line => {
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

    if (!this.osmRecommendTagsTemplate) {
      // add empty lines, to avoid that twig merges lines between expressions
      this.osmRecommendTagsTemplate = twig({ data: ob.dataset.osm.recommendTags.replace(/\n/g, '\n\n') })
    }

    const templateData = ob.templateData()
    if (osmItem) {
      templateData.osmItem = osmItem
    }

    return this.osmRecommendTagsTemplate
      .render(templateData)
      .split(/\n/g)
      .filter(f => f)
  }

  osmCompileTags (ob, osmItem) {
    if (!ob.dataset.osm || !ob.dataset.osm.compileTags) {
      return null
    }

    if (!this.osmCompileTagsTemplate) {
      // add empty lines, to avoid that twig merges lines between expressions
      this.osmCompileTagsTemplate = twig({ data: ob.dataset.osm.compileTags.replace(/\n/g, '\n\n') })
    }

    const templateData = ob.templateData()
    if (osmItem) {
      templateData.osmItem = osmItem
    }

    const compiledTags = {}
    this.osmCompileTagsTemplate
      .render(templateData)
      .split(/\n/g)
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
      return null
    }

    if (!this.wikidataRecommendPropertiesTemplate) {
      // add empty lines, to avoid that twig merges lines between expressions
      this.wikidataRecommendPropertiesTemplate = twig({ data: ob.dataset.wikidata.recommendProperties.replace(/\n/g, '\n\n') })
    }

    return this.wikidataRecommendPropertiesTemplate
      .render(ob.templateData())
      .split(/\n/g)
      .filter(f => f)
  }
}

module.exports = Dataset
