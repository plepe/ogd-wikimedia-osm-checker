module.exports = function parseMWTemplate (str, templateId) {
  const results = []

  const regexStart = new RegExp('(\{\{' + templateId + ')\s*', 'i')
  const regexEnd = new RegExp('\}\}')
  let m = str.match(regexStart)
  while (m) {
    const d = {}
    let numIndex = 1

    str = str.substr(m.index + m[1].length)
    if (str.substr(0, 1) === '\n') {
      str = str.substr(1)
    }

    m = str.match(regexEnd)
    templateText = str.substr(0, m.index)

    const rows = templateText.split(/\|/g)
    rows.forEach(row => {
      const mw = row.match(/^(.*)\n\s*$/m)
      if (mw) {
        row = mw[1]
      }
      if (row.match(/^\s*$/)) {
        return
      }

      const m1 = row.match(/^([^=]+)=(.*)$/i)
      if (m1) {
        d[m1[1].trim()] = m1[2].trim()
      } else {
        d[numIndex++] = row.trim()
      }
    })
    results.push(d)

    str = str.substr(m.index + 2)
    m = str.match(regexStart)
  }

  return results
}
