const queryString = require('query-string')

function serverLoad (dataset, options, callback) {
  const stat = {}

  let url = 'data.cgi?dataset=' + encodeURIComponent(dataset.id)
  if (options) {
    url += '&' + queryString.stringify(options)
  }

  global.fetch(url)
    .then(res => {
      if (res.headers.has('Last-Modified')) {
        stat.mtime = res.headers.get('Last-Modified')
      }
      if (res.headers.has('X-Download-Date')) {
        stat.ctime = res.headers.get('X-Download-Date')
      }

      return res.json()
    })
    .then(result => callback(null, result, stat))
}

const get = {
  items (dataset, options, callback) {
    serverLoad(dataset, options, callback)
  },

  item (dataset, id, callback) {
    serverLoad(dataset, { id }, callback)
  },

  values (dataset, key, callback) {
    serverLoad(dataset, { values: key }, callback)
  }
}

module.exports = get
