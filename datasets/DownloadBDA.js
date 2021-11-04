const iconv = require('iconv-lite')
const async = require('async')
const csvtojson = require('csvtojson')
const fs = require('fs')
const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM

module.exports = function downloadBda (callback) {
  fetch('https://bda.gv.at/denkmalverzeichnis/')
    .then(response => response.text())
    .then(result => {
      const dom = new JSDOM(result)
      let list = dom.window.document.querySelectorAll('#download-als-csv li a')
      list = Array.from(list)
      list = list.map(entry => entry.getAttribute('href'))

      downloadBdaFiles(list, callback)
    })
}

function downloadBdaFiles (urls, callback) {
  const data = []

  async.each(urls,
    (url, done) => {
      fetch(url, {})
        .then(response => {
          const converter = iconv.decodeStream('utf-8')
          const stream = response.body.pipe(converter)

          csvtojson({ delimiter: ';' })
            .fromStream(stream)
            .subscribe(line => {
              data.push(line)
            })
            .on('done', done)
        })
        .catch(e => done(e))
    },
    (err) => {
      if (err) { return callback(err.message) }

      fs.writeFile('data/bda.json', JSON.stringify(data, null, '  '), callback)
    }
  )
}
