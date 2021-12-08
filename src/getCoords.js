const twig = require('twig').twig
const turf = {
  centerOfMass: require('@turf/center-of-mass').default
}

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

  if (field.latitudeField) {
    const geometry = {}

    if (field.latitudeField.match(/\{/)) {
      if (!(field.latitudeField in twigTemplates)) {
        twigTemplates[field.latitudeField] = twig({ data: field.latitudeField })
      }

      geometry.latitude = twigTemplates[field.latitudeField].render({ item: data })
    } else {
      geometry.latitude = data[field.latitudeField]
    }

    if (field.longitudeField.match(/\{/)) {
      if (!(field.longitudeField in twigTemplates)) {
        twigTemplates[field.longitudeField] = twig({ data: field.longitudeField })
      }

      geometry.longitude = twigTemplates[field.longitudeField].render({ item: data })
    } else {
      geometry.longitude = data[field.longitudeField]
    }

    return geometry
  }

  if (field.type === 'wkt') {
    const m = geometry.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/)
    return { latitude: m[2], longitude: m[1] }
  }

  if (field.type === 'geojson') {
    if (geometry.type === 'Point') {
      return { latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] }
    } else {
      const center = turf.centerOfMass(geometry)
      return { latitude: center.geometry.coordinates[1], longitude: center.geometry.coordinates[0] }
    }
  }
}
