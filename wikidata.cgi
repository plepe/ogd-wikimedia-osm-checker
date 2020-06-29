#!/usr/bin/env node
const queryString = require('query-string')

const proc = require('./server/wikidata.js')

console.log('Content-Type: appliation/json; charset=utf8')
console.log('')

let options = queryString.parse(process.env.QUERY_STRING)

proc(options, (err, result) => {
  console.log(JSON.stringify(result, null, '  '))
})
