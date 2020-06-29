const http = require('http')
const fs = require('fs')
const queryString = require('query-string')

const cgi = {
  commons: require('./server/commons.js'),
  wikidata: require('./server/wikidata.js')
}

contentTypes = {
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

  if (req.url === '/') {
    file = '/index.html'
  } else {
    let m = req.url.match(/^(\/([\/[0-9A-Z]+)\.([A-Z]+))(\?.*|)$/i)
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

      res.setHeader("Content-Type", 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify(result, null, '  '))
    })

    return
  }

  fs.readFile(__dirname + file, (err, contents) => {
    if (err) {
      res.writeHead(500)
      res.end()
      return console.error(err)
    }

    res.setHeader("Content-Type", ext in contentTypes ? contentTypes[ext] : 'text/plain')
    res.writeHead(200)
    res.end(contents)
  })
}

const server = http.createServer(requestListener)
server.listen(8080)
