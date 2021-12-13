module.exports = function load (dataset, callback) {
  global.fetch('data.cgi?dataset=' + encodeURIComponent(dataset.id))
    .then(res => res.json())
    .then(list => callback(null, list))
}
