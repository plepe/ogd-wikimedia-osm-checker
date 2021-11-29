// compatibilty NodeJS < 11.0
require('array.prototype.flat').shim();

const http = require('http')
const fs = require('fs')
const path = require('path')
const queryString = require('query-string')

global.XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest
global.fetch = require('node-fetch')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document

const datasetsList = require('./src/datasetsList')
const cgi = require('./src/server/index')

const contentTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json'
}

const requestListener = function (req, res) {
  let file
  let proc
  let ext = 'html'
  let param = {}

  console.log('* ' + req.url)

  if (req.url === '/') {
    file = '/index.html'
  } else if (req.url === '/datasets/') {
    datasetsList({}, (err, datasets) => {
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify(datasets, null, '  '))
    })
    return
  } else {
    const m = req.url.match(/^(\/([/[0-9A-Z-_]+)\.([A-Z]+))(\?.*|)$/i)
    if (!m) {
      res.writeHead(500)
      res.end('Invalid request')
      return console.error('Invalid request: ' + req.url)
    }

    file = m[1]
    proc = m[2]
    ext = m[3]
    param = queryString.parse(m[4])
  }

  if (ext === 'cgi') {
    if (!(proc in cgi)) {
      res.writeHead(404)
      res.end('File not found')
      return console.error('Process ' + proc + ' not found')
    }

    cgi[proc](param, (err, result) => {
      if (err) {
        res.writeHead(500)
        res.end()
        return console.error(err)
      }

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify(result, null, '  '))
    })

    return
  }

  fs.readFile(path.join(__dirname, file), (err, contents) => {
    if (err) {
      res.writeHead(500)
      res.end()
      return console.error(err)
    }

    res.setHeader('Content-Type', ext in contentTypes ? contentTypes[ext] : 'text/plain')
    res.writeHead(200)
    res.end(contents)
  })
}

const server = http.createServer(requestListener)
server.listen(8080)
