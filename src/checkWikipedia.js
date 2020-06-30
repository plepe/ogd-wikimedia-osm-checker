module.exports = function checkWikipedia (id, dom, callback) {
  const div = document.createElement('div')
  dom.appendChild(div)

  div.innerHTML = '<h2>Wikipedia</h2>'

  const ul = document.createElement('ul')
  ul.className = 'check'
  div.appendChild(ul)

  ul.innerHTML += '<li class="success"><a target="_blank" href="https://tools.wmflabs.org/denkmalliste/index.php?action=EinzelID&ID=' + id + '">Wikipedia Denkmalliste</a></li>'

  callback()
}
