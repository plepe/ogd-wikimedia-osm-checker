const queryString = require('query-string')

module.exports = function datasetsList (options = {}, callback) {
  let param = ''
  if (Object.keys(options).length) {
    param = '?' + queryString.stringify(options)
  }

  global.fetch('datasets.cgi' + param)
    .then(res => res.json())
    .then(list => callback(null, list))
}

