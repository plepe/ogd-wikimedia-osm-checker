const escHTML = require('html-escape')
const map = require('./map')

module.exports = class ViewTable {
  constructor (dataset) {
    this.dataset = dataset

    const selector = document.getElementById('selector')
    selector.className = 'viewmode-map'

    map.resize()
  }

  show (items) {
    items.forEach((item, index) => {
    })
  }

  select (item) {
    console.log(item)
  }
}
