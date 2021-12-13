module.exports = function (filename, callback) {
  global.fetch(filename)
    .then(response => response.arrayBuffer())
    .then(buffer => callback(null, Buffer.from(buffer)))
}
