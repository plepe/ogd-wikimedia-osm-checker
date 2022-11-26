module.exports = class ViewBase {
  constructor (app) {
    this.app = app

    this.listeners = [
      this.app.on('update-options', (options) => this.show(options))
    ]
  }

  setDataset (dataset) {
    this.dataset = dataset
  }

  show (options) {
    return new Promise((resolve, reject) => {
      this.dataset.getExaminees(options, (err, examinees) => {
        if (err) { return reject(err) }

        this._show(examinees)
        resolve()
      })
    })
  }
}
