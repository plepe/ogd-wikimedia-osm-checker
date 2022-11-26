module.exports = class ViewBase {
  constructor (app) {
    this.app = app

    this.listeners = [
      this.app.on('update-options', (options) => this.show(options))
    ]
  }

  setDataset (dataset) {
    this.dataset = dataset

    this.show()
  }

  show () {
    return new Promise((resolve, reject) => {
      this.dataset.getExaminees(app.options, (err, examinees) => {
        if (err) { return reject(err) }

        this._show(examinees)
        resolve()
      })
    })
  }
}
