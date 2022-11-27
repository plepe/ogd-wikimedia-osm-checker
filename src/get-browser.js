const queryString = require('query-string')

function serverLoad (dataset, options, callback) {
  const stat = {}

  let url = 'data.cgi?dataset=' + encodeURIComponent(dataset.id)
  if (options) {
    options = JSON.parse(JSON.stringify(options))
    if (options.filter) {
      for (let k in options.filter) {
        options['filter.' + k] = options.filter[k]
      }
      delete options.filter
    }
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
  },

  info (dataset, options, callback) {
    serverLoad(dataset, {...options, ...{info:''}}, callback)
  }
}

module.exports = get
