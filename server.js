// compatibilty NodeJS < 11.0
require('array.prototype.flat').shim()

const async = require('async')
const http = require('http')
const fs = require('fs')
const path = require('path')
const queryString = require('query-string')

require('./src/node')

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
  } else if (req.url === '/datasets/') { // deprecated, replaced by datasets.cgi
    datasetsList({}, (err, datasets) => {
      if (err) {
        res.writeHead(500)
        res.end('Invalid request')
        return console.error("Can't read list of datasets: ", err.toString())
      }

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
    const _param = queryString.parse(m[4])
    param = {}

    for (let k in _param) {
      let m = k.split('.')
      if (m.length === 2) {
        if (!(m[0] in param)) {
          param[m[0]] = {}
        }

        param[m[0]][m[1]] = _param[k]
      } else {
        param[k] = _param[k]
      }
    }
  }

  if (ext === 'cgi') {
    if (!(proc in cgi)) {
      res.writeHead(404)
      res.end('File not found')
      return console.error('Process ' + proc + ' not found')
    }

    cgi[proc](param, (err, result, header = null) => {
      if (header) {
        Object.keys(header).forEach(k => res.setHeader(k, header[k]))
      }

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

  const fileName = path.join(__dirname, file)
  async.parallel(
    {
      contents: (done) => fs.readFile(fileName, done),
      stat: (done) => fs.stat(fileName, done)
    },
    (err, { contents, stat }) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404)
        } else {
          res.writeHead(500)
        }
        res.end()
        return console.error(err)
      }

      res.setHeader('Content-Type', ext in contentTypes ? contentTypes[ext] : 'text/plain')
      res.setHeader('Last-Modified', new Date(stat.mtime).toUTCString())
      res.setHeader('X-Download-Date', new Date(stat.ctime).toUTCString())
      res.writeHead(200)
      res.end(contents)
    }
  )
}

const server = http.createServer(requestListener)
server.listen(8080)
