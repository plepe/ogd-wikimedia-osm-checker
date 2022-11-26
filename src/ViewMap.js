const escHTML = require('html-escape')
const BoundingBox = require('boundingbox')
const ViewBase = require('./ViewBase')
const map = require('./map')

module.exports = class ViewTable extends ViewBase {
  constructor (app) {
    super(app)

    this.features = {}
  }

  setDataset (dataset) {
    this.dataset = dataset
  }

  _show (examinees) {
    let boundingbox

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-map'
    map.resize()

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
          const path = app.dataset.id + '/' + examinee.id
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

    if (this.currentFeature) {
      this.currentFeature.setStyle({
        color: 'blue'
      })
    }

    this.currentFeature = this.features[examinee.id]
    if (this.currentFeature) {
      this.currentFeature.setStyle({
        color: 'red'
      })
    }
  }
}
