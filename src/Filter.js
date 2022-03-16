const EventEmitter = require('events')
const ModulekitForm = require('modulekit-form')

class Filter extends EventEmitter {
  constructor (def) {
    super()
    this.def = def
    this.def = {
      place: {
        type: 'text',
        name: 'Ort'
      }
    }

    this.form = new ModulekitForm('filter', this.def, {
      change_on_input: true
    })

    this.form.onchange = () => this.emit('change')
  }

  show (dom) {
    this.form.show(dom)
  }

  get () {
    return this.form.get_data()
  }

  set (data) {
    this.form.set_data(data)
  }
}

module.exports = Filter
