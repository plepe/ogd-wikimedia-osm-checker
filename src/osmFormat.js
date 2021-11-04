const escHTML = require('html-escape')

const editLink = require('./editLink.js')
const wikidataToOsm = require('./wikidataToOsm.js')
const printAttrList = require('./printAttrList.js')

const recommendedTags = ['name', 'start_date', 'wikidata']

module.exports = function osmFormat (el, ob, appendTitle = '') {
  let missTags = []

  if (ob.dataset.missingTags) {
    missTags = missTags.concat(ob.dataset.missingTags(ob))
  }

  missTags = missTags.concat(wikidataToOsm.getMissingTags(ob))

  if (ob.data.commons) {
    const files = ob.data.commons.filter(page => page.title.match(/^File:/))
    const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
    if (categories.length) {
      missTags.push('wikimedia_commons=' + categories[0].title)
    } else if (files.length) {
      missTags.push('image=' + files[0].title)
    }
  }

  missTags = Array.from(new Set(missTags)) // unique

  missTags = missTags.filter(tag => {
    const [k, v] = tag.split(/=/)

    if (!(k in el.tags)) {
      return true
    }

    return !(el.tags[k] === v)
  })

  let ret = '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + escHTML(el.tags.name || 'unbenannt') + ' (' + el.type + '/' + el.id + ')</a>' + editLink(ob, el, missTags) + appendTitle

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

  if (missTags.length) {
    ret += '<li class="error">Fehlende Tags: ' + missTags.map(t => '<tt>' + escHTML(t) + '</tt>').join(', ') + '</li>'
  }

  let recTags = recommendedTags.concat()
  if (ob && ob.dataset.recommendedTags) {
    recTags = recTags.concat(ob.dataset.recommendedTags(ob))
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
