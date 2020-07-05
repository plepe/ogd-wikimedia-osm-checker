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
      let m1 = row.match(/^ *([^\s]+) *= *(.*) *$/i)
      if (m1) {
        d[m1[1]] = m1[2]
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
