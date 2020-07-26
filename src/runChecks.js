module.exports = function runChecks (ob, checks, callback, init = false) {
  if (!init) {
    ob.on('load', () => runChecks(ob, checks, callback, true))
    ob.on('loadError', (err) => {
      ob.removeAllListeners()
      callback(err)
    })
  }

  ob.clearMessages()
  checks.forEach((check, i) => check.check(ob))

  if (ob.needLoad()) {
    ob._load()
  } else {
    ob.removeAllListeners()
    callback(null)
  }
}
