module.exports = function checkWikipedia (id, dom, callback) {
  let div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikipedia</h2>'

  let ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  ul.innerHTML += '<li class="success"><a target="_blank" href="https://tools.wmflabs.org/denkmalliste/index.php?action=EinzelID&ID=' + id + '">Wikipedia Denkmalliste</a></li>'

  callback()
}
