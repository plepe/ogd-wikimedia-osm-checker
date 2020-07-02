const checks = require('./checks')

module.exports = function runChecks (ob, callback, done = null) {
  if (done === null) {
    ob.on('load', () => runChecks(ob, callback, done))
    ob.on('loadError', (err) => {
      ob.removeAllListeners()
      callback(err)
    })

    done = []
  }

  checks.forEach((check, i) => {
    if (done.includes(check)) {
      return
    }

    if (check(ob)) {
      done.push(check)
    }
  })

  if (ob.needLoad()) {
    ob._load()
  }

  if (!ob.needLoad()) {
    ob.removeAllListeners()
    callback(null)
  }
}
