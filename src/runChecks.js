module.exports = function runChecks (ob, checks, callback, done = null) {
  if (done === null) {
    ob.on('load', () => runChecks(ob, checks, callback, done))
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
  } else {
    ob.removeAllListeners()
    callback(null)
  }
}
