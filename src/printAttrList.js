const escHTML = require('html-escape')

module.exports = function (list) {
  let result = '<ul class="attrList">'

  list.forEach(entry => {
    result += '<li>' + escHTML(entry.title) + ': ' + escHTML(entry.text) + '</li>\n'
  })

  result += '</ul>\n'
  
  return result
}
