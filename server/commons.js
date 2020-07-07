const JSDOM = require('jsdom').JSDOM
const async = require('async')

const httpRequest = require('../src/httpRequest.js')

function loadTitle (title, callback) {
  httpRequest('https://commons.wikimedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=' + encodeURIComponent(title),
    {
      responseType: 'json'
    },
    (err, result) => {
      if (err) { return callback(err) }

      const page = result.body.parse
      callback(null, [{
        title: page.title,
        pageid: page.pageid,
        wikitext: page.wikitext['*']
      }])
    }
  )
}

function loadSearch (search, callback) {
  httpRequest('https://commons.wikimedia.org/w/index.php?sort=relevance&search=insource%3A' + encodeURIComponent(search) + '&title=Special:Search&profile=advanced&fulltext=1&ns6=1&ns14=1',
    {},
    (err, result) => {
      const dom = new JSDOM(result.body)
      const hits = dom.window.document.querySelectorAll('li.mw-search-result a')
      const titles = []

      hits.forEach(hit => {
        if (hit.textContent) {
          titles.push(hit.textContent)
        }
      })

      async.map(titles,
        (title, done) => loadTitle(title, (err, page) => {
          if (err) { return done(err) }
          done(null, page.length ? page[0] : null)
        }),
        callback
      )
    }
  )
}

module.exports = function (options, callback) {
  if (options.title) {
    loadTitle(options.title, callback)
  } else if (options.search) {
    loadSearch(options.search, callback)
  } else {
    return callback(new Error('now title or search provided'))
  }
}
