const async = require('async')

const httpRequest = require('./httpRequest.js')
const loadWikidata = require('./loadWikidata.js')

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
        if (result.results.bindings.length !== 1) {
          return done()
        }

        let el = result.results.bindings[0]

        if (el.commonsCat) {
          ul.innerHTML += '<li class="success">Wikidata Eintrag hat Link zu Wikimedia Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/' + encodeURIComponent(el.commonsCat.value) + '">' + (el.commonsCat.value) + '</a></li>'
        } else {
          ul.innerHTML += '<li class="warning">Wikidata Eintrag hat keinen Link zu Wikimedia Commons Kategorie</li>'
        }

        done()
      })
    }
  ], callback)
}
