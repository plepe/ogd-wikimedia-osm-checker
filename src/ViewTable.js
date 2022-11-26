const escHTML = require('html-escape')
const ViewBase = require('./ViewBase')

module.exports = class ViewTable extends ViewBase  {
  constructor (app) {
    super(app)

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-table'

    this.clear()
  }

  _show (examinees) {
    const content = document.getElementById('content')

    this.table = document.createElement('table')
    this.table.id = 'data'
    this.table.innerHTML = '<tr><th>' + escHTML(this.dataset.title) + '</th></tr>'
    content.appendChild(this.table)
    examinees.forEach((examinee, index) => {
      const text = examinee.listFormat()

      const tr = document.createElement('tr')
      tr.id = this.dataset.id + '-' + examinee.id

      const td = document.createElement('td')
      tr.appendChild(td)

      const a = document.createElement('a')
      if (typeof text === 'string') {
        a.innerHTML = text
      } else {
        a.appendChild(text)
      }
      a.href = '#' + this.dataset.id + '/' + examinee.id

      td.appendChild(a)
      this.table.appendChild(tr)
    })
  }

  select (examinee) {
    Array.from(this.table.getElementsByClassName('active')).forEach(d => d.classList.remove('active'))

    if (!examinee) {
      return
    }

    const listEntry = document.getElementById(this.dataset.id + '-' + examinee.id)
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
