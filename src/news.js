module.exports = {
  init (_app, callback) {
    fetch('dist/NEWS.html')
      .then(res => res.text())
      .then(body => {
        const dom = document.getElementById('news')
        if (body && dom) {
          dom.innerHTML = '<h1>Neuigkeiten</h1>' + body
        }

        callback(null)
      })
      .catch(err => {
        console.error('Loading NEWS.html:', err)
        callback(null)
      })
  }
}
