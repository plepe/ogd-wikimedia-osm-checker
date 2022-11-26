const ModulekitForm = require('modulekit-form')

let filter
let dataset

function clear () {
  const domFilter = document.getElementById('filter1')
  domFilter.innerHTML = ''
}

function setDataset (_dataset) {
  const domFilter = document.getElementById('filter1')
  dataset = _dataset

  return new Promise((resolve, reject) => {
    dataset.getFilter((err, def) => {
      if (err) { return reject(err) }

      filter = new ModulekitForm(
        null,
        def,
        {
          change_on_input: true,
          type: 'form_chooser',
          'button:add_element': 'Filter hinzufügen',
          order: false
        }
      )

      filter.show(domFilter)
      filter.onchange = () => app.updateOptions()

      resolve()
    })
  })
}

function getItemsOptions (options) {
  options.filter = {}

  const f = filter.get_data()
  for (const k in f) {
    if (f[k] !== null) {
      options.filter[k] = f[k]
    }
  }
}

function setExaminee (examinee) {
  const data = {}
  const currentData = filter.get_data()
  let change = false

  for (const k in filter.element.elements) {
    if (k in examinee.refData) {
      data[k] = examinee.refData[k]

      if (examinee.refData[k] != currentData[k]) {
        change = true
      }
    }
  }

  if (change) {
    console.log('filter change')
    filter.set_data(data)
    app.updateOptions()
  }
}

module.exports = {
  init (app, callback) {
    callback()

    app.on('set-dataset', setDataset, { promisify: true })
    app.on('set-examinee', setExaminee)
    app.on('get-items-options', getItemsOptions)
  }
}
