const twig = require('twig').twig

const twigTemplates = {}

module.exports = function getCoords (data, field) {
  if (!field) {
    return null
  }

  let geometry
  if (field.id) {
    if (field.id.match(/\{/)) {
      if (!(field.id in twigTemplates)) {
        twigTemplates[field.id] = twig({ data: field.id })
      }

      geometry = twigTemplates[field.id].render({ item: data })
    } else {
      geometry = data[field.id]
    }
  }

  if (field.type === 'wkt') {
    const m = geometry.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    return { latitude: m[2], longitude: m[1] }
  }

  if (field.type === 'geojson') {
    if (geometry.type === 'Point') {
      return { latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] }
    }
  }
}
