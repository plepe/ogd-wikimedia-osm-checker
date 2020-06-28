#!/usr/bin/env node
const queryString = require('query-string')
const fetch = require('node-fetch')

console.log('Content-Type: appliation/json; charset=utf8')
console.log('')

let options = queryString.parse(process.env.QUERY_STRING)

if (options.title) {
  fetch('https://commons.wikimedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=' + encodeURIComponent(options.title))
    .then(res => res.json())
    .then(body => {
      console.log(JSON.stringify(body, null, '  '))
    })
}
