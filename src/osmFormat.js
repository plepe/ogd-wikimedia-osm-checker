const escHTML = require('html-escape')

const editLink = require('./editLink.js')
const printAttrList = require('./printAttrList.js')
const osmAddTags = require('./osmAddTags.js')

const recommendTags = []

module.exports = function osmFormat (el, ob, appendTitle = '') {
  const compiledTags = osmAddTags(ob, el)

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

  let recTags = recommendTags.concat()
  if (ob && ob.dataset.osmRecommendTags) {
    recTags = recTags.concat(ob.dataset.osmRecommendTags(ob, el))
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
