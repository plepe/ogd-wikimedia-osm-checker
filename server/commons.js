const JSDOM = require('jsdom').JSDOM
const fetch = require('node-fetch')
const async = require('async')

function loadTitle (title, callback) {
  fetch('https://commons.wikimedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=' + encodeURIComponent(title))
    .then(res => res.json())
    .then(body => {
      let page = body.parse
      callback(null, [{
        title: page.title,
        pageid: page.pageid,
        wikitext: page.wikitext['*']
      }])
    })
    .catch(e => callback(e))
}

function loadSearch (search, callback) {
  fetch('https://commons.wikimedia.org/w/index.php?sort=relevance&search=insource%3A' + encodeURIComponent(search) + '&title=Special:Search&profile=advanced&fulltext=1&ns6=1&ns14=1')
    .then(res => {
      let str = ''
      res.body.on('data', (chunk) => str += chunk)
      res.body.on('end', () => {
        console.log('here')
        const dom = new JSDOM(str)
        let hits = dom.window.document.querySelectorAll('li.mw-search-result a')
        let titles = []

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
      })
    })
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
