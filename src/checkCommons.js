const async = require('async')
const escHTML = require('html-escape')

const httpRequest = require('./httpRequest.js')
const loadWikidata = require('./loadWikidata.js')

function checkCategory (id, value, ul, callback) {
  fetch('commons.cgi?title=' + encodeURIComponent('Category:' + value))
    .then(res => res.json())
    .then(body => {
      let text = body.parse.wikitext['*']

      let m = text.match(/\{\{\ *(doo|Denkmalgeschütztes Objekt Österreich)\|(1=)?([0-9]+)\ *\}\}/)
      if (m && m[3] === id) {
        ul.innerHTML += '<li class="success">Commons Kategorie hat Verweis auf BDA ID</li>'
      } else if (m) {
        ul.innerHTML += '<li class="error">Commons Kategorie hat Verweis auf falsche BDA ID: ' + m[3] + '</li>'
      } else {
        ul.innerHTML += '<li class="error">Commons Kategorie hat keinen Verweis auf BDA ID. Füge <tt>{{Denkmalgeschütztes Objekt Österreich|' + id + '}}</tt> hinzu.</li>'
      }

      m = text.match(/\{\{\ *Wikidata Infobox\ *(\||\}\})/)
      if (m) {
        ul.innerHTML += '<li class="success">Commons Kategorie hat Wikidata Infobox</li>'
      } else {
        ul.innerHTML += '<li class="error">Commons Kategorie hat keine Wikidata Infobox. Füge <tt>{{Wikidata Infobox}}</tt> hinzu.</li>'
      }

      callback()
    })
}

module.exports = function checkOSM (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikimedia Commons</h2>'

  let ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  async.parallel([
    done => {
      loadWikidata(id, (err, result) => {
        if (result.length !== 1) {
          return done()
        }

        let el = result[0]

        // image
        if (el.claims.P18) {
          let images = el.claims.P18
          if (images.length === 1) {
            ul.innerHTML += '<li class="success">Wikidata Eintrag hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(images[0].mainsnak.datavalue.value) + '">Bild</a></li>'
          } else {
            ul.innerHTML += '<li class="success">Wikidata Eintrag hat ' + images.length + ' Bilder: ' + images.map((image, i) => '<a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(image.mainsnak.datavalue.value) + '">#' + (i + 1) + '</a>').join(', ') + '</li>'
          }
        } else {
          ul.innerHTML += '<li class="warning">Wikidata Eintrag hat kein Bild</li>'
        }

        // commons category
        if (el.claims.P373) {
          let data = el.claims.P373
          ul.innerHTML += '<li class="success">Wikidata Eintrag hat Link zu Wikimedia Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + encodeURIComponent(data[0].mainsnak.datavalue.value) + '">' + escHTML(data[0].mainsnak.datavalue.value) + '</a></li>'

          checkCategory(id, data[0].mainsnak.datavalue.value, ul, done)
        } else {
          ul.innerHTML += '<li class="warning">Wikidata Eintrag hat keinen Link zu Wikimedia Commons Kategorie</li>'
          done()
        }
      })
    }
  ], callback)
}
