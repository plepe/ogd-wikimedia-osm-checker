const escHTML = require('html-escape')

const httpRequest = require('./httpRequest.js')
const loadWikidata = require('./loadWikidata.js')

const recommendedTags = ['name', 'start_date', 'artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']

function overpassQuery (query, callback) {
  httpRequest('https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      responseType: 'json',
      body: '[out:json];' + query
    },
    (err, result) => {
      if (err) { return callback(err) }
      callback(null, result.body)
    }
  )
}

module.exports = function checkOSM (id, dom, callback) {
  const div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>OpenStreetMap</h2>'

  const ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  loadWikidata(id, (err, result) => {
    if (err) {
      // ignore errors
    }

    let wikidataId
    let query = 'nwr["ref:at:bda"=' + id + '];'
    if (result && result.length === 1) {
      wikidataId = result[0].id
      query += 'nwr[wikidata=' + wikidataId + '];'
    }

    overpassQuery('(' + query + ');out tags;',
      (err, result) => {
        if (err) {
          console.error(err)
          return callback()
        }

        const refBdaResult = result.elements.filter(el => el.tags['ref:at:bda'] === id)
        const refWdResult = result.elements.filter(el => el.tags.wikidata === wikidataId)

        if (refWdResult.length && refBdaResult.length && refWdResult.length === refBdaResult.length) {
          ul.innerHTML += '<li class="success">' + refBdaResult.length + ' Objekt via <tt>ref:at:bda=' + id + '</tt> und <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refBdaResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', ') + '</li>'
        } else if (refBdaResult.length && refWdResult.length && refBdaResult.length !== refWdResult.length) {
          ul.innerHTML += '<li class="error">Unterschiedliche Anzahl von Objekten mit <tt>ref:at:bda=' + id + '</tt> und/oder <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden: ' + result.elements.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', ') + '</li>'
        } else if (refBdaResult.length) {
          ul.innerHTML += '<li class="success">' + refBdaResult.length + ' Objekt via <tt>ref:at:bda=' + id + '</tt> gefunden: ' + refBdaResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', ') + '</li>'
          const wrongWikidata = refBdaResult.filter(entry => !!entry.tags.wikidata)
          if (wrongWikidata.length) {
            ul.innerHTML += '<li class="error">Eintrag mit anderer Wikidata ID gefunden, potentielles Duplikat: <a target="_blank" href="https://wikidata.org/wiki/' + escHTML(wrongWikidata[0].tags.wikidata) + '">' + escHTML(wrongWikidata[0].tags.wikidata) + '</a></li>'
          } else {
            ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!</li>'
          }
        } else if (refWdResult.length) {
          ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>ref:at:bda=' + id + '</tt> in der OpenStreetMap gefunden!</li>'
          ul.innerHTML += '<li class="success">' + refWdResult.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + refWdResult.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>').join(', ') + '</li>'
        } else {
          ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>ref:at:bda=' + id + '</tt> oder <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!</li>'
        }

        result.elements.forEach(el => {
          let text = ''
          for (const tag in el.tags) {
            text += escHTML(tag) + '=' + escHTML(el.tags[tag]) + '</br>'
          }

          ul.innerHTML += '<li class="success">' +
            (result.elements.length > 1 ? '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>: ' : '') +
            'Folgende Tags gefunden:<dl>' + text + '</dl></li>'

          const missTags = recommendedTags.filter(tag => !(tag in el.tags))
          ul.innerHTML += '<li class="warning">' +
            (result.elements.length > 1 ? '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>: ' : '') +
            'Folgende empfohlene Tags nicht gefunden: ' + missTags.join(', ') + '</li>'
        })

        callback()
      }
    )
  })
}
