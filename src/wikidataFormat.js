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
  let attrList = []

  attrList.push({
    key: 'label',
    title: 'Name',
    value: ob.labels,
    text: label(ob.labels)
  })
  attrList.push({
    key: 'descriptions',
    title: 'Beschreibung',
    value: ob.descriptions,
    text: label(ob.descriptions)
  })

  forEach(ob.claims, (values, key) => {
    attrList.push({
      key: key,
      title: ob.claimsTitle[key],
      value: values,
      text: values
        .map((value) => value.text)
        .join(', ')
    })
  })

  return printAttrList(attrList) // + '<pre>' + JSON.stringify(ob, null, '  ') + '</pre>'
}
