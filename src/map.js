const L = require('leaflet')

let map

const data = {
  init (_app, callback) {
    data.map = L.map('map').setView([51.505, -0.09], 13)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(data.map)

    callback()
  },

  resize () {
    data.map.invalidateSize()
  }
}

module.exports = data
