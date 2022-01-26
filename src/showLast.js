const moment = require('moment')
require('moment/locale/de')
const escHTML = require('html-escape')

module.exports = function showLast () {
  const dom = document.getElementById('last')
  if (!dom) {
    return
  }

  fetch('log.cgi?last=10')
    .then(res => res.json())
    .then(data => {
      dom.innerHTML = ''

      data.forEach(e => {
        const li = document.createElement('li')
        li.innerHTML =
          '<span class="ts" value="' + escHTML(e.ts) + '">' + escHTML(moment(e.ts).format('lll')) + '</span>' +
          '<a class="path" href="#' + escHTML(e.path) + '">' + escHTML(e.path) + '</a>'
        dom.appendChild(li)
      })
    })
}
