const async = require('async')

const httpRequest = require('./httpRequest.js')
const loadWikidata = require('./loadWikidata.js')

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
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>OpenStreetMap</h2>'

  let ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  async.parallel([
    done => {
      overpassQuery('nwr["ref:at:bda"=' + id + '];out tags;',
        (err, result) => {
          if (err) {
            console.error(err)
            return callback()
          }

          if (result.elements.length) {
            ul.innerHTML += '<li class="success">' + result.elements.length + ' Objekt via <tt>ref:at:bda=' + id + '</tt> gefunden: ' + result.elements.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + (el.tags.name || (el.type + '/' + el.id)) + '</a>').join(', ') + '</li>'
          } else {
            ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>ref:at:bda=' + id + '</tt> in der OpenStreetMap gefunden!</li>'
          }

          done()
        }
      )
    },
    done => {
      loadWikidata(id, (err, result) => {
        if (result.results.bindings.length === 1) {
          let wikidataId = result.results.bindings[0].item.value.match(/(Q[0-9]+)$/)[1]

          overpassQuery('nwr[wikidata=' + wikidataId + '];out tags;',
            (err, result) => {
              if (err) {
                console.error(err)
                return callback()
              }

              if (result.elements.length) {
                ul.innerHTML += '<li class="success">' + result.elements.length + ' Objekt via <tt>wikidata=' + wikidataId + '</tt> gefunden: ' + result.elements.map(el => '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + (el.tags.name || (el.type + '/' + el.id)) + '</a>').join(', ') + '</li>'
              } else {
                ul.innerHTML += '<li class="error">Kein Eintrag mit <tt>wikidata=' + wikidataId + '</tt> in der OpenStreetMap gefunden!</li>'
              }

              done()
            }
          )
        } else {
          done()
        }
      })
    }
  ], callback)
}
