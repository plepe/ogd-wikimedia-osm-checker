const ModulekitLang = require('modulekit-lang')

module.exports = {
  init (_app, callback) {
    ModulekitLang.set('de', (err) => {
      if (err) { callback(err) }
      global.lang_str = ModulekitLang.current().lang_str
      callback(null)
    })
  }
}
