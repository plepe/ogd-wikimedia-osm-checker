const escHTML = require('html-escape')

const recommendedTags = ['name', 'start_date']

module.exports = function osmFormat (el, ob) {
  let ret = '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + escHTML(el.tags.name) + ' (' + el.type + '/' + el.id + ')</a>'

  let tagKeys = Object.keys(el.tags || {})
  ret += '<ul class="attrList">' +
    tagKeys.map(
      (key) => '<li>' + escHTML(key) + '=' + escHTML(el.tags[key]) + '</li>'
    ).join('') +
    '</ul>'

  let recTags = recommendedTags.concat()
  if (ob && ob.dataset.recommendedTags) {
    recTags = recTags.concat(ob.dataset.recommendedTags(ob))
  }

  const missTags = recTags.filter(tag => !(tag in el.tags))

  if (missTags.length) {
    ret += '<ul class="check"><li class="warning">Empfohlene weitere Tags: ' + missTags.map(t => '<tt>' + escHTML(t) + '</tt>').join(', ') + '</li></ul>'
  }

  return ret
}
