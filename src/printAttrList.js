const escHTML = require('html-escape')

module.exports = function (list) {
  let result = '<ul class="attrList">'

  list.forEach(entry => {
    if (!entry) { return }

    let title = ''
    if (entry.value) {
      title = ' title="' + escHTML(typeof entry.value === 'object' ? JSON.stringify(entry.value, null, '  ') : entry.value) + '"'
    }

    let tagStart = 'span'
    let tagEnd = 'span'
    if (entry.link) {
      tagStart = 'a target="_blank" href="' + escHTML(entry.link) + '"'
      tagEnd = 'a'
    }

    result += '<li><span' + (entry.key ? ' title="' + escHTML(entry.key) + '"' : '') + ' class="key">' + escHTML(entry.title) + '</span>: <' + tagStart + title + ' class="value">' + escHTML(entry.text) + '</' + tagEnd + '></li>\n'
  })

  result += '</ul>\n'
  
  return result
}
