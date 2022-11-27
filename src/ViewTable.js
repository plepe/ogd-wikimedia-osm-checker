const escHTML = require('html-escape')
const ViewBase = require('./ViewBase')

module.exports = class ViewTable extends ViewBase  {
  constructor (app) {
    super(app)

    this.clear()

    this.listeners.push(this.app.on('set-dataset', () => this.reloadCount()))
    this.listeners.push(this.app.on('update-options', () => this.reloadCount()))
    this.loadCount()
  }

  loadCount (callback) {
    if (!callback) { callback = () => {} }

    if (this.count !== undefined) {
      return callback(null, this.count)
    }

    if (!this.app.dataset) {
      this.count = undefined
      return callback(null, undefined)
    }

    if (this.loadCountCallbacks) {
      return this.loadCountCallbacks.push(callback)
    }

    this.loadCountCallbacks = [callback]

    const opt = {}
    if (this.app.options && this.app.options.filter) {
      opt.filter = this.app.options.filter
    }
    this.app.dataset.getCount(opt, (err, c) => {
      this.count = c
      console.log(c)

      const cbs = this.loadCountCallbacks
      delete this.loadCountCallbacks
      cbs.forEach(cb => cb(err, c))
    })
  }

  reloadCount (callback) {
    this.count = undefined
    this.loadCount(callback)
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
