const loadWikidata = require('./loadWikidata.js')

const recommendedReferences = {
  P84: 'Architekt_in',
  P170: 'Urheber_in',
  P186: 'Material',
  P580: 'Startzeitpunkt',
  P417: 'Patron_in',
  P180: 'Motiv',
  P7842: 'Wien Geschichte Wiki ID'
}

module.exports = function checkWikidata (id, dom, callback) {
  const div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikidata</h2>'

  const ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  loadWikidata(id, (err, result) => {
    if (err) { return callback(err) }

    if (result.length > 1) {
      ul.innerHTML += '<li class="success">' + result.length + ' Objekt gefunden: ' + result.map(el => '<a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a>').join(', ') + '</li>'
    } else if (result.length === 1) {
      const el = result[0]
      ul.innerHTML += '<li class="success">1 Objekt gefunden: <a target="_blank" href="https://wikidata.org/wiki/' + el.id + '">' + el.id + '</a></li>'

      // coords
      if (el.claims.P625) {
        const coords = el.claims.P625[0].mainsnak.datavalue.value

        ul.innerHTML += '<li class="success">Eintrag hat Koordinaten: <a target="_blank" href="https://openstreetmap.org/?mlat=' + coords.latitude + '&mlon=' + coords.longitude + '#map=19/' + coords.latitude + '/' + coords.longitude + '">' + coords.latitude + ', ' + coords.longitude + '</a></li>'
      } else {
        ul.innerHTML += '<li class="warning">Eintrag hat keine Koordinaten</li>'
      }

      if (!el.claims.P31) {
        ul.innerHTML += '<li class="error">Objekt hat keine "ist ein(e)" Angabe</li>'
      } else if (el.claims.P31.length === 1 && el.claims.P31[0].mainsnak.datavalue.value.id === 'Q2065736') {
        ul.innerHTML += '<li class="error">Objekt ist nur als Kulturgut eingetragen ("ist ein(e)").</li>'
      }

      const recommandations = []
      for (const k in recommendedReferences) {
        if (!(k in el.claims)) {
          recommandations.push(recommendedReferences[k])
        }
      }

      if (recommandations.length) {
        ul.innerHTML += '<li class="warning">Empfohlene weitere Angaben: ' + recommandations.join(', ') + '</li>'
      }
    } else {
      ul.innerHTML += '<li class="error">Kein Eintrag gefunden!</li>'
    }

    callback()
  })
}
