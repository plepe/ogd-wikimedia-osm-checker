const escHTML = require('html-escape')
const ViewBase = require('./ViewBase')

module.exports = class ViewTable extends ViewBase  {
  constructor (app) {
    super(app)

    this.clear()
  }

  _show (examinees) {
    const selector = document.getElementById('selector')
    selector.className = 'viewmode-table'

    this.clear()
    const content = document.getElementById('view-table')

    this.table = document.createElement('table')
    this.table.id = 'data'
    this.table.innerHTML = '<tr><th>' + escHTML(this.app.dataset.title) + '</th></tr>'
    content.appendChild(this.table)
    examinees.forEach((examinee, index) => {
      const text = examinee.listFormat()

      const tr = document.createElement('tr')
      tr.id = this.app.dataset.id + '-' + examinee.id

      const td = document.createElement('td')
      tr.appendChild(td)

      const a = document.createElement('a')
      if (typeof text === 'string') {
        a.innerHTML = text
      } else {
        a.appendChild(text)
      }
      a.href = '#' + this.app.dataset.id + '/' + examinee.id

      td.appendChild(a)
      this.table.appendChild(tr)
    })
  }

  select () {
    Array.from(this.table.getElementsByClassName('active')).forEach(d => d.classList.remove('active'))

    if (!this.app.examinee) {
      return
    }

    const listEntry = document.getElementById(this.app.dataset.id + '-' + this.app.examinee.id)
    if (listEntry) {
      listEntry.classList.add('active')
      listEntry.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  clear () {
    const content = document.getElementById('view-table')
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }
  }
}
