const escHTML = require('html-escape')

const editLink = require('./editLink.js')
const wikidataToOsm = require('./wikidataToOsm.js')
const printAttrList = require('./printAttrList.js')

const recommendedTags = ['name', 'start_date', 'wikidata']

module.exports = function osmFormat (el, ob, appendTitle = '') {
  let compiledTags = {}

  if (ob.dataset.osmCompileTags) {
    compiledTags = {...compiledTags, ...ob.dataset.osmCompileTags(ob, el)}
  }

  compiledTags = {...compiledTags, ...wikidataToOsm.compileTags(ob, el)}

  if (ob.data.commons) {
    const files = ob.data.commons.filter(page => page.title.match(/^File:/))
    const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
    if (categories.length) {
      compiledTags.wikimedia_commons = categories[0].title
    } else if (files.length) {
      compiledTags.image = files[0].title
    }
  }

  Object.keys(compiledTags).forEach(k => {
    v = compiledTags[k]

    if (k in el.tags && el.tags[k] === v) {
      delete compiledTags[k]
    }
  })

  let ret = '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + escHTML(el.tags.name || 'unbenannt') + ' (' + el.type + '/' + el.id + ')</a>' + editLink(ob, el, compiledTags) + appendTitle

  const tagKeys = Object.keys(el.tags || {})

  const attrList = tagKeys.map(key => {
    return {
      key,
      title: key,
      value: el.tags[key],
      text: el.tags[key]
    }
  })
  ret += printAttrList(attrList)

  ret += '<ul class="check">'

  if (Object.keys(compiledTags).length) {
    ret += '<li class="error">Fehlende Tags: ' + printCompiledTags(compiledTags) + '</li>'
  }

  let recTags = recommendedTags.concat()
  if (ob && ob.dataset.osmRecommendedTags) {
    recTags = recTags.concat(ob.dataset.osmRecommendedTags(ob, el))
  }

  recTags = recTags.filter(tag => {
    const [k, v] = tag.split(/=/)

    if (!(k in el.tags)) {
      return true
    }

    if (v === undefined) {
      return false
    }

    return !(el.tags[k] === v)
  })

  if (recTags.length) {
    ret += '<li class="warning">Empfohlene weitere Tags: ' + recTags.map(t => '<tt>' + escHTML(t) + '</tt>').join(', ') + '</li>'
  }

  ret += '</ul>'

  return ret
}

function printCompiledTags (tags) {
  return Object.keys(tags).map(t => '<tt>' + escHTML(t) + '=' + escHTML(tags[t]) + '</tt>').join(', ')
}
