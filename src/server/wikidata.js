const async = require('async')
const JSDOM = require('jsdom').JSDOM
const fetch = require('node-fetch')

const httpRequest = require('../httpRequest.js')
const findWikidataItems = require('find-wikidata-items')

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
  if (options.query) {
    // accept arbitrary query
  } else if (!options.key || !options.key.match(/^(id|P[0-9]+)$/)) {
    return callback(new Error('illegal key'))
  } else if (!options.id) {
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
        callback(err, [result])
        next(options)
      }
    )
  }

  if (options.query) {
    return loadByQuery(options,
      (err, result) => {
        callback(err, [result])
        next(options)
      }
    )
  }

  const query = {}
  query[options.key] = options.id

  const _options = JSON.parse(JSON.stringify(options))
  delete _options.key
  delete _options.id

  findWikidataItems([query], _options, (err, results) => {
    next(options)
    if (err) { return callback(err) }

    if (!results[0]) {
      return callback(null, [])
    }

    processResults(results, options, callback)
  })
}

function loadByQuery (options, callback) {
  fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(options.query),
    {
      headers: {
        // lower case to avoid forbidden request headers, see:
        // https://github.com/ykzts/node-xmlhttprequest/pull/18/commits/7f73611dc3b0dd15b0869b566f60b64cd7aa3201
        'user-agent': 'wikipedia-list-extractor',
        accept: 'application/json'
      },
      responseType: 'json'
    })
    .then(response => response.json())
    .then(result => {
      next(options)

      const list = []
      result.results.bindings.forEach(item => {
        const id = item.item.value.match(/(Q[0-9]+)$/)[1]
        list[id] = null
      })

      const _options = JSON.parse(JSON.stringify(options))
      delete _options.query

      processResults([list], _options, (err, result) => {
        if (err) { return callback(err) }
        callback(null, result[0])
      })
    })
    .catch(err => {
      next(options)
      global.setTimeout(() => callback(err), 0)
    })
}

function processResults (results, options, callback) {
  async.map(Object.keys(results[0]),
    (id, done) => {
      const _options = JSON.parse(JSON.stringify(options))
      _options.key = 'id'
      _options.id = id

      request(
        _options,
        (err, r) => done(err, r.length ? r[0] : null)
      )
    },
    (err, results) => {
      callback(err, results)
    }
  )
}

module.exports = request
