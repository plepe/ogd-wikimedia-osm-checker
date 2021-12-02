const wikidataToOsm = require('./wikidataToOsm.js')

module.exports = function osmAddTags (ob, el) {
  let compiledTags = {}

  if (ob.dataset.osmAddTags) {
    compiledTags = { ...compiledTags, ...ob.dataset.osmAddTags(ob, el) }
  }

  compiledTags = { ...compiledTags, ...wikidataToOsm.addTags(ob, el) }

  if (ob.data.wikidataSelected) {
    compiledTags.wikidata = ob.data.wikidataSelected.id
  } else if (ob.data.commons) {
    const files = ob.data.commons.filter(page => page.title.match(/^File:/))
    const categories = ob.data.commons.filter(page => page.title.match(/^Category:/))
    if (categories.length) {
      compiledTags.wikimedia_commons = categories[0].title
    } else if (files.length) {
      compiledTags.image = files[0].title
    }
  }

  if (el) {
    Object.keys(compiledTags).forEach(k => {
      const v = compiledTags[k]

      if (k in el.tags && el.tags[k] === v) {
        delete compiledTags[k]
      }
    })
  }

  return compiledTags
}
