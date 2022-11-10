const escHTML = require('html-escape')
const BoundingBox = require('boundingbox')

const map = require('./map')
const getCoords = require('./getCoords')

module.exports = class ViewTable {
  constructor (dataset) {
    this.dataset = dataset

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-map'

    map.resize()

    this.features = []
  }

  show (items) {
    let boundingbox

    this.clear()

    items.forEach((item, index) => {
      const coord = getCoords(item, this.dataset.refData.coordField)

      if (coord) {
        if (!boundingbox) {
          boundingbox = new BoundingBox(coord)
        } else {
          boundingbox.extend(coord)
        }

        const feature = L.circleMarker([coord.latitude, coord.longitude])
        feature.addTo(map.map)

        feature.on('click', () => {
          const id = this.dataset.refData.idField ? item[this.dataset.refData.idField] : index
          const path = this.dataset.id + '/' + id
          global.location.hash = path
        })

        this.features.push(feature)
      }
    })

    if (boundingbox) {
      map.map.fitBounds(boundingbox.toLeaflet())
    }
  }

  clear () {
    this.features.forEach(feature => {
      feature.removeFrom(map.map)
    })

    this.features = []
  }

  select (item) {
    console.log(item)
  }
}
