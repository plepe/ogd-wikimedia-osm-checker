const escHTML = require('html-escape')

module.exports = function showBDA (data, dom) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Bundesdenkmalamt</h2>'

  let ul = document.createElement('ul')
  div.appendChild(ul)

  ul.innerHTML += '<li>ID: ' + data.ObjektID + '</li>'
  ul.innerHTML += '<li>Bezeichnung: ' + escHTML(data.Bezeichnung) + '</li>'
  ul.innerHTML += '<li>Gemeinde: ' + escHTML(data.Gemeinde) + '</li>'
  ul.innerHTML += '<li>Kat.gemeinde: ' + escHTML(data.KG) + '</li>'
  ul.innerHTML += '<li>Adresse: ' + escHTML(data.Adresse) + '</li>'
  ul.innerHTML += '<li>Grundstücknr.: ' + escHTML(data.GdstNr) + '</li>'
  ul.innerHTML += '<li>Status: ' + escHTML(data.Status) + '</li>'
}
