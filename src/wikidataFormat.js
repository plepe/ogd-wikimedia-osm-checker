const forEach = require('foreach')

const printAttrList = require('./printAttrList.js')

function label (labels) {
  let lang = ['de-at', 'de', 'en'].filter(l => labels[l])
  if (!lang.length) {
    return ''
  }

  return labels[lang[0]].value
}

module.exports = function wikidataFormat (ob) {
  let attrList = {}

  attrList['Name'] = label(ob.labels)
  attrList['Beschreibung'] = label(ob.descriptions)

  forEach(ob.claims, (values, key) => {
    attrList[ob.claimsTitle[key]] = values
        .map((value) => value.text)
        .join(', ')
  })

  return printAttrList(attrList) // + '<pre>' + JSON.stringify(ob, null, '  ') + '</pre>'
}
