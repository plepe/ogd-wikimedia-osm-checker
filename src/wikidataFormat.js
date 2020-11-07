const forEach = require('foreach')

function label (labels) {
  let lang = ['de-at', 'de', 'en'].filter(l => labels[l])
  if (!lang.length) {
    return ''
  }

  return labels[lang[0]].value
}

module.exports = function wikidataFormat (ob) {
  let result = '<ul class="attrList">'
  
  result += '<li>Name: ' + label(ob.labels) + '</li>\n'
  result += '<li>Beschreibung: ' + label(ob.descriptions) + '</li>\n'

  forEach(ob.claims, (values, key) => {
    result += '<li>' + ob.claimsTitle[key] + ': ' +
      values
        .map((value) => value.text)
        .join(', ') + '</li>\n'
  })

  result += '</ul>\n'

  return result// + '<pre>' + JSON.stringify(ob, null, '  ') + '</pre>'
}
