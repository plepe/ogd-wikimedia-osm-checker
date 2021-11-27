const async = require('async')
const escHTML = require('html-escape')
const natsort = require('natsort').default
const twig = require('twig').twig

const createGeoLink = require('./createGeoLink')

class Dataset {
  load (callback) {
    if (this.data) {
      return callback(null)
    }

    const placeFilter = {}
    this.data = {}

    async.parallel([
      done => {
        global.fetch('data/' + this.filename)
          .then(res => {
            if (!res.ok) {
              throw Error('loading BDA data: ' + res.statusText)
            }

            return res.json()
          })
          .then(json => {
            json = this.convertData(json)

            json.forEach(entry => {
              this.data[entry[this.refData.idField]] = entry
              placeFilter[entry[this.refData.placeFilterField] || 'alle'] = true
            })

            done()
          })
          // .catch(e => done(e))
      }
    ],
    err => {
      if (err) { return callback(err) }

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
    if (!this.refData.format || this.refData.format === 'json') {
      return data
    }

    if (this.refData.format === 'geojson') {
      const result = {}

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
  }
}

module.exports = Dataset
