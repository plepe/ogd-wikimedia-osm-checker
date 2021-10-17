const async = require('async')
const JSDOM = require('jsdom').JSDOM

const httpRequest = require('../src/httpRequest.js')

const active = []
const pending = []
const maxActive = 1
let interval

function loadById (id, callback) {
  async.parallel([
    done => {
      httpRequest('https://www.wikidata.org/wiki/Special:EntityData/' + id + '.json',
        {
          responseType: 'json'
        },
        (err, result) => {
          if (err) { return done(err) }

          done(null, result.body.entities[id])
        }
      )
    },
    done => {
      httpRequest('https://www.wikidata.org/wiki/' + id + '?uselang=de',
        {
        },
        (err, result) => {
          if (err) { return done(err) }

          const dom = new JSDOM(result.body)

          done(null, dom)
        }
      )
    }
  ], (err, [result, dom]) => {
    if (err) {
      return callback(err)
    }

    result.claimsTitle = {}

    const properties = dom.window.document.querySelectorAll('div.wikibase-statementgrouplistview > div.wikibase-listview > div')
    properties.forEach(prop => {
      const id = prop.getAttribute('id')

      const propTitle = prop.querySelector('div.wikibase-statementgroupview-property-label > a').textContent

      result.claimsTitle[id] = propTitle

      let text = prop.querySelectorAll('.wikibase-statementview-mainsnak > .wikibase-snakview > .wikibase-snakview-value-container > .wikibase-snakview-body > .wikibase-snakview-value')
      text = Array.from(text)
      text.forEach((v, i) => {
        result.claims[id][i].text = v.textContent
      })
    })

    callback(null, result)
  })
}

function next (options) {
  // console.log('done', JSON.stringify(options))
  active.splice(active.indexOf(options), 1)
}

function _next () {
  if (!pending.length) {
    global.clearInterval(interval)
    interval = null
    return
  }

  if (active.length >= maxActive) {
    return
  }

  const req = pending.shift()
  active.push(req[0])
  _request(req[0], req[1])
}

function request (options, callback) {
  if (!options.key || !options.key.match(/^(id|P[0-9]+)$/)) {
    return callback(new Error('illegal key'))
  }

  if (!options.id) {
    return callback(new Error('illegal id'))
  }

  pending.push([options, callback])

  if (!interval) {
    interval = global.setInterval(_next, 1000)
  }
}

function _request (options, callback) {
  // console.log('start', JSON.stringify(options))
  if (options.key === 'id') {
    return loadById(options.id,
      (err, result) => {
        if (err) { return callback(err) }
        callback(null, [result])
        next(options)
      }
    )
  }

  const query = 'SELECT ?item WHERE { ?item wdt:' + options.key + ' "' + options.id.replace(/"/g, '\\"') + '".}'
  httpRequest('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query),
    {
      headers: {
        // lower case to avoid forbidden request headers, see:
        // https://github.com/ykzts/node-xmlhttprequest/pull/18/commits/7f73611dc3b0dd15b0869b566f60b64cd7aa3201
        'user-agent': 'ogd-wikimedia-osm-checker',
        accept: 'application/json'
      },
      responseType: 'json'
    },
    (err, result) => {
      next(options)
      if (err) { return callback(err) }

      async.map(result.body.results.bindings,
        (entry, done) => {
          const wikidataId = entry.item.value.match(/(Q[0-9]+)$/)[1]
          request(
            { key: 'id', id: wikidataId },
            (err, r) => done(err, r.length ? r[0] : null)
          )
        },
        (err, results) => {
          callback(err, results)
        }
      )
    }
  )
}

module.exports = request
