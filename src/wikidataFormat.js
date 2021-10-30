const forEach = require('foreach')

const printAttrList = require('./printAttrList.js')

const links = {
  P18: function (value) {
    return 'https://commons.wikimedia.org/wiki/File:' + value.mainsnak.datavalue.value.replace(/ /g, '_')
  },
  P373: function (value) {
    return 'https://commons.wikimedia.org/wiki/Category:' + value.mainsnak.datavalue.value.replace(/ /g, '_')
  },
  P625: function (value) {
    const coords = value.mainsnak.datavalue.value
    return 'https://openstreetmap.org/?mlat=' + coords.latitude + '&mlon=' + coords.longitude + '#map=19/' + coords.latitude + '/' + coords.longitude + '">' + coords.latitude + ', ' + coords.longitude
  }
}

function label (labels) {
  const lang = ['de-at', 'de', 'en'].filter(l => labels[l])
  if (!lang.length) {
    return ''
  }

  return labels[lang[0]].value
}

module.exports = function wikidataFormat (ob) {
  const attrList = []

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
    const attr = {
      key: key,
      title: ob.claimsTitle[key],
      value: values,
      text: values.map(value => value.text)
    }

    if (key in links) {
      attr.link = values.map(value => links[key](value))
    } else if (values[0].mainsnak.datavalue.value['entity-type'] === 'item') {
      attr.link = values.map(value => 'https://wikidata.org/wiki/' + value.mainsnak.datavalue.value.id)
    }

    attrList.push(attr)
  })

  return printAttrList(attrList) // + '<pre>' + JSON.stringify(ob, null, '  ') + '</pre>'
}
