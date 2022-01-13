module.exports = function load (dataset, callback) {
  const stat = {}

  global.fetch('data.cgi?dataset=' + encodeURIComponent(dataset.id))
    .then(res => {
      if (res.headers.has('Last-Modified')) {
        stat.mtime = res.headers.get('Last-Modified')
      }
      if (res.headers.has('X-Download-Date')) {
        stat.ctime = res.headers.get('X-Download-Date')
      }

      return res.json()
    })
    .then(list => callback(null, list, stat))
}
