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
    if (this.refData.listFieldTitle.match(/\{/)) {
      if (!this.listFieldTitleTemplate) {
        this.listFieldTitleTemplate = twig({ data: this.refData.listFieldTitle })
      }
      value = this.listFieldTitleTemplate.render({item})
    } else if (this.refData.listFieldTitle) {
      value = escHTML(item[this.refData.listFieldTitle])
    } else {
      value = escHTML(item[this.refData.idField])
    }

    result += '<span class="title">' + value + '</span>'

    value = null
    if (this.refData.listFieldAddress.match(/\{/)) {
      if (!this.listFieldAddressTemplate) {
        this.listFieldAddressTemplate = twig({ data: this.refData.listFieldAddress })
      }
      value = this.listFieldAddressTemplate.render({item})
    } else if (this.refData.listFieldAddress) {
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

      result += ' <span class="url">(<a target="_blank" href="' + this.urlTemplate.render({item}) + '">Website</a>)</span>'
    }

    result += '</li>'

    if (this.refData.showFields) {
      Object.keys(this.refData.showFields).forEach(fieldId => {
        const field = this.refData.showFields[fieldId] || {}
        let value = item[fieldId]
        if (field.format) {
          if (!field.template) {
            field.template = twig({ data: field.format })
          }

          value = field.template.render({item})
        }

        if (value) {
          result += '<li class="field-' + fieldId + '">'
          result += '<span class="label">' + escHTML(field.title || fieldId) + '</span>: '
          result += '<span class="value">' + escHTML(value) + '</span>'
          result += '</li>'
        }
      })
    }

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
}

module.exports = Dataset
