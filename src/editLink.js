const escHTML = require('html-escape')

const getAllCoords = require('../src/getAllCoords.js')

const editTooltips = [
  'Lege Knoten in JOSM mit Fernsteuerung an',
  'Lege Knoten mit Tags in JOSM mit Fernsteuerung an',
  'Bearbeite Objekt in JOSM mit Fernsteuerung',
  'Bearbeite Objekt in JOSM mit Fernsteuerung und füge Tags hinzu'
]

global.osmEdit = function (param) {
  param.split(/;/).forEach(p => {
    let url = 'http://127.0.0.1:8111/' + p

    let xhr = new XMLHttpRequest()
    xhr.open('get', url, true)
    xhr.responseType = 'text'
    xhr.send()
  })
}

module.exports = function editLink (ob, osmOb=null, tagChange=null) {
  let bounds
  let buffer = 0.0001
  let url = []

  if (osmOb) {
    bounds = osmOb.bounds
    if (osmOb.type === 'node') {
      bounds = {
        minlat: osmOb.lat,
        maxlat: osmOb.lat,
        minlon: osmOb.lon,
        maxlon: osmOb.lon
      }
    }

    url[0] = 'load_and_zoom?select=' + osmOb.type + osmOb.id
  } else {
    let allCoords = getAllCoords(ob)

    if (!allCoords.length) {
      return ''
    }

    buffer = 0.0005
    bounds = {
      minlat: Math.min.apply(null, allCoords.map(c => c.latitude)),
      maxlat: Math.max.apply(null, allCoords.map(c => c.latitude)),
      minlon: Math.min.apply(null, allCoords.map(c => c.longitude)),
      maxlon: Math.max.apply(null, allCoords.map(c => c.longitude))
    }

    url[0] = 'load_and_zoom?'
    url[1] = 'add_node?lon=' + allCoords[0].longitude +
          '&lat=' + allCoords[0].latitude
  }

  url[0] += '&left=' + (bounds.minlon - buffer).toFixed(5) +
        '&right=' + (bounds.maxlon + buffer).toFixed(5) +
        '&top=' + (bounds.maxlat + buffer).toFixed(5) +
        '&bottom=' + (bounds.minlat - buffer).toFixed(5)

  if (tagChange && tagChange.length) {
    url[url.length - 1] += '&addtags=' + tagChange
      .map(kv => {
        let [k, v] = kv.split(/=/)
        return encodeURIComponent(k) + '=' + encodeURIComponent(v)
      })
      .join('%7C')
  }

  const title = editTooltips[(url.length === 2 ? 0 : 2) + (tagChange && tagChange.length ? 1 : 0)]
  return ' <a href=\'javascript:osmEdit("' + url.map(u => encodeURI(u)).join(';') + '")\' title="' + title + '">✎</a>'
}
