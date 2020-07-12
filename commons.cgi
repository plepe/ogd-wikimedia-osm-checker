#!/usr/bin/env node
const queryString = require('query-string')
global.XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest

const proc = require('./server/commons.js')

let options = queryString.parse(process.env.QUERY_STRING)

proc(options, (err, result) => {
  if (err) {
    console.log('Status: 500 Internal Server Error')
    console.log('Content-Type: text/plain; charset=utf8')
    console.log('')

    return console.log(err.message)
  }

  console.log('Content-Type: appliation/json; charset=utf8')
  console.log('')

  console.log(JSON.stringify(result, null, '  '))
})
