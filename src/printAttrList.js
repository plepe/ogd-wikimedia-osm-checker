const forEach = require('foreach')
const escHTML = require('html-escape')

module.exports = function (list) {
  let result = '<ul class="attrList">'

  forEach(list, (value, key) => {
    result += '<li>' + escHTML(key) + ': ' + escHTML(value) + '</li>\n'
  })

  result += '</ul>\n'
  
  return result
}
