const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  if (!ob.data.commons) {
    return ob.load('commons', {search: options.replace(/\$1/g, 43443)})
  }

  console.log(ob.data.commons)
  return true
}
