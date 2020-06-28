module.exports = function loadWikidata (id, callback) {
  fetch('wikidata.cgi?id=' + id)
    .then(res => res.json())
    .then(result => callback(null, result))
}
