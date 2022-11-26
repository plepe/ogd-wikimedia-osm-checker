module.exports = class ViewBase {
  constructor (app) {
    this.app = app

    this.listeners = [
      this.app.on('update-options', () => this.show()),
      this.app.on('set-dataset', () => this.show())
    ]

    this.show()
  }

  show () {
    if (!this.app.dataset) {
      return
    }

    return new Promise((resolve, reject) => {
      this.app.dataset.getExaminees(this.app.options, (err, examinees) => {
        if (err) { return reject(err) }

        this._show(examinees)
        resolve()
      })
    })
  }
}
