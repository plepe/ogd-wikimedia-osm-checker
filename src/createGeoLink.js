const getCoords = require('./getCoords')

module.exports = function createGeoLink(data, field) {
  let coords = data
  if (field) {
    coords = getCoords(data, field)
  }

  if (!coords) {
    return 'nicht gefunden'
  }

  return '<a target="_blank" href="https://openstreetmap.org/?mlat=' + coords.latitude + '&mlon=' + coords.longitude + '#map=19/' + coords.latitude + '/' + coords.longitude + '">' + parseFloat(coords.latitude).toFixed(5) + ', ' + parseFloat(coords.longitude).toFixed(5) + '</a></li>'
}
