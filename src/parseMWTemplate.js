const regexKey = new RegExp('^\\s*([^=|{}\\[\\]]*)=', '')
const regexNextField = new RegExp('\\|', 'm')
const regexEnd = new RegExp('\}\}', 'm')
const regexNest = new RegExp('(\\[\\[|\\{\\{)', 'm')

function findNested (str) {
  const currentNest = str.match(/^(\{\{|\[\[)(.*)/)
  if (!currentNest) {
    return 0
  }

  let length = currentNest[1].length
  str = str.substr(length)

  let regexEndNest
  if (currentNest[1] === '{{') {
    regexEndNest = new RegExp('\\}\\}', 'm')
  } else if (currentNest[1] === '[[') {
    regexEndNest = new RegExp('\\]\\]', 'm')
  }

  let mNest = str.match(regexNest)
  let mEnd = str.match(regexEndNest)
  while (mNest && (!mEnd || mNest.index < mEnd.index)) {
    str = str.substr(mNest.index)
    const l = findNested(str)
    length += mNest.index + l
    str = str.substr(l)

    mNest = str.match(regexNest)
    mEnd = str.match(regexEndNest)
  }

  length += mEnd.index + mEnd[0].length
  return length
}

module.exports = function parseMWTemplate (str, templateId) {
  const results = []

  const regexStart = new RegExp('(\\{\\{\\s*' + templateId + '\\s*(\\||\\}\\}))', 'im')
  let m = str.match(regexStart)
  while (m) {
    const d = {}
    let numIndex = 1

    str = str.substr(m.index + m[1].length)
    if (str.substr(0, 1) === '\n') {
      str = str.substr(1)
    }

    if (m[2] === '}}') {
      results.push(d)
      m = str.match(regexStart)
      continue
    }

    let key = null
    let value = ''
    let done = false
    while (!done) {
      const mKey = str.match(regexKey)
      const mNest = str.match(regexNest)
      const mNext = str.match(regexNextField)
      const mEnd = str.match(regexEnd)

      if (value === '' && mKey) {
        key = mKey[1].trim()
        str = str.substr(mKey[0].length)
      } else if (mNext && (!mNest || mNext.index < mNest.index) && (!mEnd || mNext.index < mEnd.index)) {
        value += str.substr(0, mNext.index)
        str = str.substr(mNext.index + 1)
        if (value !== '' || key) {
          d[key === null ? numIndex : key] = value.trim()
        }

        numIndex++
        key = null
        value = ''
      } else if (mNest && (!mEnd || mNest.index < mEnd.index)) {
        const length = findNested(str.substr(mNest.index))
        value += str.substr(0, mNest.index + length)
        str = str.substr(mNest.index + length)
      } else if (mEnd) {
        value += str.substr(0, mEnd.index)
        str = str.substr(mEnd.index + 2)
        if (value !== '' || key) {
          d[key === null ? numIndex : key] = value.trim()
        }
        results.push(d)
        done = true
      } else {
        done = true
      }
    }

    m = str.match(regexStart)
  }

  return results
}
