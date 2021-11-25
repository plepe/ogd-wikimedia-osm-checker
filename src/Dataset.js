const async = require('async')
const escHTML = require('html-escape')
const natsort = require('natsort').default

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

  showFormat (item) {
    let result = '<h2>' + escHTML(this.operator) + '</h2>'

    result += '<li class="field-id">'
    result += '<span class="label">ID</span>: '
    result += '<span class="value">' + escHTML(item[this.refData.idField]) + '</span>'
    result += '</li>'

    if (this.refData.showFields) {
      Object.keys(this.refData.showFields).forEach(fieldId => {
        const field = this.refData.showFields[fieldId] || {}
        const value = item[fieldId]

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
