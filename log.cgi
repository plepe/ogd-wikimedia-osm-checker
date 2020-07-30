#!/usr/bin/env node
const queryString = require('query-string')

const proc = require('./server/log.js')

let options = queryString.parse(process.env.QUERY_STRING)

proc(options, (err, result) => {
  console.log('Content-Type: appliation/json; charset=utf8')
  console.log('')

  console.log(JSON.stringify(result))
})
