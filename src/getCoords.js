module.exports = function getCoords (data, field) {
  if (!field) {
    return null
  }

  if (field.type === 'wkt') {
    const m = data[field.id].match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    return { latitude: m[2], longitude: m[1] }
  }

  if (field.type === 'geojson') {
    const m = data[field.id]
    if (m.type === 'Point') {
      return { latitude: m.coordinates[1], longitude: m.coordinates[0] }
    }
  }
}
