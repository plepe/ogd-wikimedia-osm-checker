let count = 0

module.exports = {
  start () {
    count++
    document.body.classList.add('loading')
  },

  end () {
    if (--count <= 0) {
      document.body.classList.remove('loading')
    }
  }
}
