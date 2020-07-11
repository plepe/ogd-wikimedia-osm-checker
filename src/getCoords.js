module.exports = function getCoords (data, field) {
  if (!field) {
    return null
  }

  if (field.type === 'shape') {
    let m = data[field.id].match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    return {latitude: m[2], longitude: m[1]}
  }
}
