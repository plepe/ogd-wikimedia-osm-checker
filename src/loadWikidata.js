const callbacks = {}

module.exports = function loadWikidata (id, callback) {
  if (id in callbacks) {
    callbacks[id].push(callback)
    return
  }

  callbacks[id] = [callback]

  fetch('wikidata.cgi?id=' + id)
    .then(res => res.json())
    .then(result => {
      let cbs = callbacks[id]
      delete callbacks[id]

      cbs.forEach(cb => cb(null, result))
    })
}
