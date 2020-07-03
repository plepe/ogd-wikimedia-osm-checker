const fetch = require('node-fetch')

module.exports = function (options, callback) {
  if (!options.title) {
    return callback(new Error('now title provided'))
  }

  fetch('https://commons.wikimedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=' + encodeURIComponent(options.title))
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
