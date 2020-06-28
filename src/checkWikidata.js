const loadWikidata = require('./loadWikidata.js')

module.exports = function checkWikidata (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikidata</h2>'

  let ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  loadWikidata(id, (err, result) => {
    if (result.results.bindings.length > 1) {
      ul.innerHTML += '<li class="success">' + result.results.bindings.length + " Objekt gefunden: " + result.results.bindings.map(el => '<a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a>').join(', ') + '</li>'
    } else if (result.results.bindings.length === 1) {
      let el = result.results.bindings[0]
      ul.innerHTML += '<li class="success">1 Objekt gefunden: <a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a></li>'

      // image
      if (el.image) {
        ul.innerHTML += '<li class="success">Eintrag hat ein <a target="_blank" href="' + el.image.value + '">Bild</a></li>'
      } else {
        ul.innerHTML += '<li class="warning">Eintrag hat kein Bild</li>'
      }

      // coords
      if (el.coords) {
        let coords = el.coords.value.match(/^Point\((\-?[0-9]+\.[0-9]+) (\-?[0-9]+\.[0-9]+)\)$/)

        ul.innerHTML += '<li class="success">Eintrag hat Koordinaten: <a target="_blank" href="https://openstreetmap.org/#map=19/' + coords[2] + '/' + coords[1] + '">' + el.coords.value + '</a></li>'
      } else {
        ul.innerHTML += '<li class="warning">Eintrag hat keine Koordinaten</li>'
      }
    } else {
      ul.innerHTML += '<li class="error">Kein Eintrag gefunden!</li>'
    }

    callback()
  })
}
