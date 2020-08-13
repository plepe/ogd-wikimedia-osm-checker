const escHTML = require('html-escape')

const editLink = require('./editLink.js')

const recommendedTags = ['name', 'start_date', 'wikidata']

module.exports = function osmFormat (el, ob, appendTitle = '') {
  let missTags = []
  if (ob.dataset.missingTags) {
    missTags = ob.dataset.missingTags(ob)

    missTags = missTags.filter(tag => {
      let [k, v] = tag.split(/=/)

      if (!(k in el.tags)) {
        return true
      }

      return !(el.tags[k] === v)
    })
  }

  let ret = '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + escHTML(el.tags.name || 'unbenannt') + ' (' + el.type + '/' + el.id + ')</a>' + editLink(ob, el, missTags) + appendTitle

  let tagKeys = Object.keys(el.tags || {})
  ret += '<ul class="attrList">' +
    tagKeys.map(
      (key) => '<li>' + escHTML(key) + '=' + escHTML(el.tags[key]) + '</li>'
    ).join('') +
    '</ul>'

  ret += '<ul class="check">'

  if (missTags.length) {
    ret += '<li class="error">Fehlende Tags: ' + missTags.map(t => '<tt>' + escHTML(t) + '</tt>').join(', ') + '</li>'
  }

  let recTags = recommendedTags.concat()
  if (ob && ob.dataset.recommendedTags) {
    recTags = recTags.concat(ob.dataset.recommendedTags(ob))
  }

  recTags = recTags.filter(tag => {
    let [k, v] = tag.split(/=/)

    if (!(k in el.tags)) {
      return true
    }

    return !(el.tags[k] === v)
  })

  if (recTags.length) {
    ret += '<li class="warning">Empfohlene weitere Tags: ' + recTags.map(t => '<tt>' + escHTML(t) + '</tt>').join(', ') + '</li>'
  }

  ret += '</ul>'

  return ret
}
