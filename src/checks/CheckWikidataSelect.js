const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckWikidataSelect extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!ob.data.wikidata) {
      return
    }

    const div = document.createElement('span')
    div.appendChild(document.createTextNode(ob.data.wikidata.length + ' mögliche Wikidata Objekt(e) gefunden, wähle: '))

    const select = document.createElement('select')
    select.id = 'wikidata-select'
    select.onchange = () => {
      ob.data.wikidataSelected = null
      ob.data.wikidata.forEach(item => {
        if (select.value === item.id) {
          ob.data.wikidataSelected = item
        }
      })
      ob.runChecks(ob.dataset, {}, () => {})
    }
    div.appendChild(select)

    const optionOther = document.createElement('option')
    optionOther.value = ''
    optionOther.appendChild(document.createTextNode('kein passendes gefunden'))

    if (ob.data.wikidata.length === 0) {
      select.appendChild(optionOther)

      ob.message('wikidata', STATUS.SUCCESS, div)
      return true
    }

    const selectedId = ob.data.wikidataSelected ? ob.data.wikidataSelected.id : null

    ob.data.wikidata.forEach(item => {
      const option = document.createElement('option')
      option.value = item.id
      if (selectedId === item.id) {
        option.selected = true
      }
      option.appendChild(document.createTextNode(('de' in item.labels ? item.labels.de.value + ' ' : '') + '(' + item.id + ')'))
      select.appendChild(option)
    })

    if (selectedId === null) {
      optionOther.selected = true
    }
    select.appendChild(optionOther)
    ob.message('wikidata', null, div)
  }
}

module.exports = options => new CheckWikidataSelect()
