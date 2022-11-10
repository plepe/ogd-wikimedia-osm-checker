const escHTML = require('html-escape')

module.exports = class ViewTable {
  constructor (dataset) {
    this.dataset = dataset

    const content = document.getElementById('content')
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }

    this.table = document.createElement('table')
    this.table.id = 'data'
    this.table.innerHTML = '<tr><th>' + escHTML(this.dataset.title) + '</th></tr>'
    content.appendChild(this.table)
  }

  show (items) {
    items.forEach((item, index) => {
      const id = this.dataset.refData.idField ? item[this.dataset.refData.idField] : index

      const text = this.dataset.listFormat(item, index)

      const tr = document.createElement('tr')
      tr.id = this.dataset.id + '-' + id

      const td = document.createElement('td')
      tr.appendChild(td)

      const a = document.createElement('a')
      if (typeof text === 'string') {
        a.innerHTML = text
      } else {
        a.appendChild(text)
      }
      a.href = '#' + this.dataset.id + '/' + id

      td.appendChild(a)
      this.table.appendChild(tr)
    })
  }
}
