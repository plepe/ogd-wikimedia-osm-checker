module.exports = function parseMWTemplate (str, templateId) {
  let results = []

  let regexStart = new RegExp('(\{\{' + templateId + ')', 'i')
  let regexEnd = new RegExp('\}\}')
  let m = str.match(regexStart)
  while (m) {
    let d = {}

    str = str.substr(m.index)
    m = str.match(regexEnd)
    templateText = str.substr(0, m.index)

    let rows = templateText.split(/\n\|/g)
    rows.forEach(row => {
      if (row.substr(-1) === '\n') {
        row = row.substr(0, row.length - 1)
      }

      let m1 = row.match(/^([^=]+)=(.*)$/i)
      if (m1) {
        d[m1[1].trim()] = m1[2].trim()
      } else {
        console.log('cant parse', row)
      }
    })
    results.push(d)

    str = str.substr(m.index + 2)
    m = str.match(regexStart)
  }

  return results
}
