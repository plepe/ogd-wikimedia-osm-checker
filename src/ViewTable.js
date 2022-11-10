const escHTML = require('html-escape')

module.exports = class ViewTable {
  constructor (dataset) {
    this.dataset = dataset

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-table'

    this.clear()
    const content = document.getElementById('content')

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

  select (item) {
    Array.from(this.table.getElementsByClassName('active')).forEach(d => d.classList.remove('active'))

    const listEntry = document.getElementById(this.dataset.id + '-' + item.id)
    if (listEntry) {
      listEntry.classList.add('active')
      listEntry.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  clear () {
    const content = document.getElementById('content')
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }
  }
}
