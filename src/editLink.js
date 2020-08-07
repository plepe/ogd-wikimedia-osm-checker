global.osmEdit = function (param) {
  let url = 'http://127.0.0.1:8111/load_and_zoom?' + param

  let xhr = new XMLHttpRequest()
  xhr.open('get', url, true)
  xhr.responseType = 'text'
  xhr.send()
}

module.exports = function editLink (ob, osmOb=null, tagChange={}) {
  let bounds = osmOb.bounds
  if (osmOb.type === 'node') {
    bounds = {
      minlat: osmOb.lat,
      maxlat: osmOb.lat,
      minlon: osmOb.lon,
      maxlon: osmOb.lon
    }
  }

  let url = 'left=' + (bounds.minlon - 0.0001).toFixed(5) +
        '&right=' + (bounds.maxlon + 0.0001).toFixed(5) +
        '&top=' + (bounds.maxlat + 0.0001).toFixed(5) +
        '&bottom=' + (bounds.minlat - 0.0001).toFixed(5) +
        '&select=' + osmOb.type + osmOb.id

  let text = ' <a href=\'javascript:osmEdit("' + url + '")\' title="Edit in JOSM with remote control enabled">✎</a> '

  return text
}
