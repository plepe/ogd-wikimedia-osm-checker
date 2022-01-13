const async = require('async')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM

let downloaded = false
let date = null

module.exports = function downloadBevAdressregister (callback) {
  async.waterfall([
    (done) => {
      // first check, if downloaded
      fs.stat('tmp/bev-adressregister.zip',
        (err, result) => {
          if (result) {
            date = new Date(result.mtime)
            downloaded = true
          }

          if (err && err.errno != -2) {
            console.error('DownloadBevAdressregister:', err)
            return done(err)
          }

          done()
        }
      )
    },
    (done) => {
      fs.mkdir('tmp/', {recursive: true}, (err) => done(err))
    },
    (done) => {
      if (downloaded) {
        return done(null, null)
      }

      fetch('https://www.bev.gv.at/portal/page?_pageid=713,2601271&_dad=portal&_schema=PORTAL')
        .then(response => response.text())
        .then(result => {
          const dom = new JSDOM(result)
          const link = dom.window.document.querySelector('table tr td a')

          const m = link.textContent.match(/Stichtagsdaten ([0-9]{2})\.([0-9]{2})\.([0-9]{4})\.zip/)
          if (m) {
            date = new Date(m[3] + '-' + m[2] + '-' + m[1] + 'T12:00:00Z')
          }

          done(null, 'https://www.bev.gv.at' + link.getAttribute('href'))
        })
    },
    (url, done) => {
      if (downloaded) {
        return done()
      }

      fetch(url)
        .then(response => {
          const writer = fs.createWriteStream('tmp/bev-adressregister.zip')
          response.body.pipe(writer)

          writer.on('finish', () => {
            fs.utimes('tmp/bev-adressregister.zip', date, date, done)
          })
          writer.on('error', err => {
            console.error('DownloadBevAdressregister:', err)
            done(err)
          })
        })
    },
    (done) => {
      const zip = new StreamZip({ file: 'tmp/bev-adressregister.zip' })

      zip.on('error', err => console.error(err))

      zip.on('ready', () => {
        zip.extract('STRASSE.csv', 'data/bev-strassen.csv', (err) => {
          if (err) { return done(err) }
          fs.utimes('data/bev-strassen.csv', date, date, done)
        })
      })
    }
  ], callback)
}
