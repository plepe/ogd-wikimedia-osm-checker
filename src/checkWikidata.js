module.exports = function checkWikidata (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikidata</h2>'

  fetch('wikidata.cgi?id=' + id)
    .then(res => res.json())
    .then(result => {
      if (result.results.bindings.length) {
        div.innerHTML += result.results.bindings.length + " Objekt gefunden: " + result.results.bindings.map(el => '<a target="_blank" href="' + el.item.value + '">' + el.item.value.match(/(Q[0-9]+)$/)[1] + '</a>').join(', ')
      } else {
        div.innerHTML += "Kein Eintrag gefunden!"
      }
    })
}
