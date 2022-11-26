const viewModes = {
  table: require('./ViewTable'),
  map: require('./ViewMap')
}

let app
let currentView

function chooseViewMode () {
  const viewMode = document.getElementById('viewMode').value
  const ViewMode = viewModes[viewMode]

  if (currentView) {
    currentView.remove()
  }

  currentView = new ViewMode(app)
}


module.exports = {
  init (_app, callback) {
    app = _app

    callback()

    document.getElementById('viewMode').onchange = chooseViewMode
    chooseViewMode()
  }
}
