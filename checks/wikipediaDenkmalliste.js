const STATUS = require('../src/status.js')

module.exports = function init (options) {
  return check.bind(this, options)
}

// result:
// - null/false: not finished yet
// - true: check is finished
function check (options, ob) {
  return ob.message('wikipedia', STATUS.SUCCESS, '<a target="_blank" href="https://tools.wmflabs.org/denkmalliste/index.php?action=EinzelID&ID=' + ob.id + '">Wikipedia Denkmalliste</a></li>')
}
