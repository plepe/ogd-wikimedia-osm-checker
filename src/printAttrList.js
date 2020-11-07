const escHTML = require('html-escape')

function formatValue (entry) {
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

  return '<' + tagStart + title + ' class="value">' + escHTML(entry.text) + '</' + tagEnd + '>'
}

module.exports = function (list) {
  let result = '<ul class="attrList">'

  list.forEach(entry => {
    if (!entry) { return }

    result += '<li><span' + (entry.key ? ' title="' + escHTML(entry.key) + '"' : '') + ' class="key">' + escHTML(entry.title) + '</span>: '

    if (Array.isArray(entry.text)) {
      result += entry.text
        .map((v, k) => formatValue({
          value: entry.value ? entry.value[k] : null,
          link: entry.link ? entry.link[k] : null,
          text: v
        }))
        .join(',\n')
    } else {
      result += formatValue(entry)
    }

    result += '</li>'
  })

  result += '</ul>\n'
  
  return result
}
