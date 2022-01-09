const twigRender = require('../twigRender')
const createGeoLink = require('../createGeoLink')
const STATUS = require('../status.js')
const Check = require('../Check.js')

class CheckGeocoder extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.geocoder || !dataset.geocoder.query) {
      return true
    }

    const query = {}
    Object.keys(dataset.geocoder.query).forEach(k => {
      query[k] = twigRender(dataset.geocoder.query[k], ob.templateData()).trim()
    })

    const result = ob.loadResult('geocoder', query)
    if (result === undefined) {
      return false
    }

    if (!result.length) {
      ob.message('geocoder', STATUS.ERROR, 'Adresse konnte nicht gefunden werden.')
    } else if (result.length === 1) {
      ob.message('geocoder', STATUS.SUCCESS, 'Adresse konnte gefunden werden: ' + createGeoLink({latitude: result[0].lat, longitude: result[0].lon}))
      ob.data.geocoderSelected = result[0]
    }

    const div = document.createElement('span')
    div.appendChild(document.createTextNode(result.length + ' mögliche Adressen gefunden, wähle: '))

    const select = document.createElement('select')
    select.id = 'geocoder-select'
    select.onchange = () => {
      result.forEach(item => {
        if (select.value === '' + item.place_id) {
          ob.data.geocoderSelected = item
        }
      })
      ob.runChecks(ob.dataset, {}, () => {})
    }
    div.appendChild(select)

    let selectedId
    if (ob.data.geocoderSelected) {
      selectedId = ob.data.geocoderSelected.place_id
    } else {
      selectedId = result[0].place_id
      ob.data.geocoderSelected = result[0]
    }

    result.forEach(item => {
      const option = document.createElement('option')
      option.value = item.place_id
      if (selectedId === item.place_id) {
        option.selected = true
      }
      option.appendChild(document.createTextNode(item.display_name))
      select.appendChild(option)
    })

    const geoLink = document.createElement('span')
    geoLink.innerHTML = createGeoLink({latitude: ob.data.geocoderSelected.lat, longitude: ob.data.geocoderSelected.lon})
    div.appendChild(geoLink)

    ob.message('geocoder', STATUS.SUCCESS, div)
  }
}

module.exports = options => new CheckGeocoder(options)
