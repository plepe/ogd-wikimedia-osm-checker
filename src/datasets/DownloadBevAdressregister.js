const async = require('async')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM

let downloaded = false

module.exports = function downloadBevAdressregister (callback) {
  async.waterfall([
    (done) => {
      // first check, if downloaded
      fs.stat('tmp/bev-adressregister.zip',
        (err, result) => {
          if (result) {
            downloaded = true
          }

          done()
        }
      )
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
            done(null)
          })
          writer.on('error', err => {
            console.error(dataset.id, err)
            done(err)
          })
        })
    },
    (done) => {
      const zip = new StreamZip({ file: 'tmp/bev-adressregister.zip' })

      zip.on('error', err => console.error(err))

      zip.on('ready', () => {
        zip.extract('STRASSE.csv', 'data/bev-strassen.csv', done)
      })
    }
  ], callback)
}
