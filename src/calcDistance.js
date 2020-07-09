const Boundingbox = require('boundingbox')
const turf = {
  pointToLineDistance: require('@turf/point-to-line-distance').default,
  pointsWithinPolygon: require('@turf/points-within-polygon').default
}

module.exports = function calcDistance (poi, bounds) {
  bounds = new Boundingbox(bounds).toGeoJSON()
  poi = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [
        poi.longitude,
        poi.latitude
      ]
    }
  }

  // poi is within bounds -> distance=0
  if (turf.pointsWithinPolygon(poi, bounds).features.length) {
    return 0
  }

  const boundsLine = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: bounds.geometry.coordinates[0]
    }
  }

  return turf.pointToLineDistance(poi, boundsLine)
}
