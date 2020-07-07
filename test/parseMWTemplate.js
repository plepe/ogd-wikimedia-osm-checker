const assert = require('assert')

const parseMWTemplate = require('../src/parseMWTemplate.js')

describe('parseMWTemplate', () => {
  it ('single line', () => {
    let result = parseMWTemplate('{{doo|2345}}', 'doo')

    assert.deepEqual(result, [{'1': '2345'}])
  })
  it ('single line, multiple templates', () => {
    let result = parseMWTemplate('{{doo|2345|8765}}\n{{Doo|1=1234|2=2345}}', 'doo')

    assert.deepEqual(result, [{'1': '2345', 2:'8765'}, {'1': '1234', 2: '2345'}])
  })
  it ('multiple line', () => {
    let result = parseMWTemplate('{{doo\n | foo = 2345\n | bar = text with whitespace }}\n{{Doo|1=1234}}', 'doo')

    assert.deepEqual(result, [{foo: '2345', bar: 'text with whitespace'}, {'1': '1234'}])
  })
})
