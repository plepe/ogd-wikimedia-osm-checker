const escHTML = require('html-escape')

const STATUS = require('../src/status.js')

const recommendedTags = ['name', 'start_date', 'artist_name', 'artist:wikidata', 'architect', 'architect:wikidata', 'historic']

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  let wikidataId

  if (!ob.data.osm) {
    // wait for wikidata info to be loaded
    return
  }

  if (!ob.data.osm.length) {
    return true
  }

  const results = ob.data.osm
  results.forEach(el => {
    let text = ''
    for (const tag in el.tags) {
      text += escHTML(tag) + '=' + escHTML(el.tags[tag]) + '</br>'
    }

    ob.message('osm', STATUS.SUCCESS,
      (results.length > 1 ? '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>: ' : '') +
      'Folgende Tags gefunden:<dl>' + text + '</dl>'
    )

    const missTags = recommendedTags.filter(tag => !(tag in el.tags))
    ob.message('osm', STATUS.WARNING,
      (results.length > 1 ? '<a target="_blank" href="https://openstreetmap.org/' + el.type + '/' + el.id + '">' + el.type + '/' + el.id + '</a>: ' : '') +
      'Folgende empfohlene Tags nicht gefunden: ' + missTags.join(', '))
  })
  return true
}
