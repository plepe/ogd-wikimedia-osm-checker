const escHTML = require('html-escape')
const BoundingBox = require('boundingbox')

const map = require('./map')

module.exports = class ViewTable {
  constructor (app) {
    this.app = app

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-map'

    map.resize()

    this.features = {}

    this.listeners = [
      this.app.on('update-options', (options) => this.show(options))
    ]
  }

  setDataset (dataset) {
    this.dataset = dataset
  }

  show (options) {
    return new Promise((resolve, reject) => {
      this.dataset.getExaminees(options, (err, examinees) => {
        if (err) { return reject(err) }

        this._show(examinees)
        resolve()
      })
    })
  }

  _show (examinees) {
    let boundingbox

    this.clear()

    examinees.forEach(examinee => {
      const coord = examinee.geometry()

      if (coord) {
        if (!boundingbox) {
          boundingbox = new BoundingBox(coord)
        } else {
          boundingbox.extend(coord)
        }

        const feature = L.circleMarker([coord.latitude, coord.longitude])
        feature.addTo(map.map)

        feature.on('click', () => {
          const path = this.dataset.id + '/' + examinee.id
          global.location.hash = path
        })

        this.features[examinee.id] = feature
      }
    })

    if (boundingbox) {
      map.map.fitBounds(boundingbox.toLeaflet())
    }
  }

  clear () {
    Object.values(this.features).forEach(feature => {
      feature.removeFrom(map.map)
    })

    this.features = {}
  }

  select (examinee) {
    if (!examinee) {
      return
    }

    const feature = this.features[examinee.id]

    feature.setStyle({
      color: 'red'
    })
  }
}
