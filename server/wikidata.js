const async = require('async')
const JSDOM = require('jsdom').JSDOM

const httpRequest = require('../src/httpRequest.js')
const findWikidataItems = require('wikipedia-list-extractor/src/findWikidataItems')

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

  const query = {}
  query[options.key] = options.id

  const _options = JSON.parse(JSON.stringify(options))
  delete _options.key
  delete _options.id

  findWikidataItems([query], _options, (err, results) => {
    if (err) { return callback(err) }
    next(options)

    async.map(results[0],
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
  })
}

module.exports = request
