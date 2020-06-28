const httpRequest = require('./httpRequest.js')

module.exports = function checkOSM (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>OpenStreetMap</h2>'

  httpRequest('https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      responseType: 'json',
      body: '[out:json];nwr["ref:at:bda"=' + id + '];out tags;'
    },
    (err, result) => {
      if (result.body.elements.length) {
        div.innerHTML += result.body.elements.length + " Objekt gefunden: " + result.body.elements.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + (el.tags.name || (el.type + '/' + el.id)) + '</a>').join(', ')
      } else {
        div.innerHTML += "Kein Eintrag in der OpenStreetMap gefunden!"
      }

      callback()
    }
  )
}
