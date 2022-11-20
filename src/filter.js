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
      filter.onchange = () => app.update()

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

function setItem (item) {
  const data = {}

  for (const k in filter.elements) {
    if (k in item) {
      data[k] = item[k]
    }
  }

  filter.set_data(data)
}

module.exports = {
  init (app, callback) {
    callback()

    app.on('set-dataset', setDataset, { promisify: true })
    app.on('set-item', setItem)
    app.on('get-items-options', getItemsOptions)
  }
}
