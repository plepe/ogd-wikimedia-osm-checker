const http = require('http')
const fs = require('fs')
const queryString = require('query-string')

contentTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json'
}

const requestListener = function (req, res) {
  let file
  let ext = 'html'
  let param = {}

  if (req.url === '/') {
    file = '/index.html'
  } else {
    let m = req.url.match(/^(\/[\/[0-9A-Z]+\.([A-Z]+))(\?.*|)$/i)
    if (!m) {
      res.writeHead(500)
      res.end('Invalid request')
      return console.error('Invalid request: ' + req.url)
    }

    file = m[1]
    ext = m[2]
    param = queryString.parse(m[3])
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
