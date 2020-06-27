const async = require('async')

let data = {}

function show (k) {
  let entry = data[k]

  let tr = document.createElement("tr")
  let td

  td = document.createElement("td")
  td.appendChild(document.createTextNode(k))
  tr.appendChild(td)

  td = document.createElement("td")
  tr.appendChild(td)

  entry.bda.forEach(d => {
    td.appendChild(document.createTextNode(d.Bezeichnung))
    td.appendChild(document.createElement('br'))
  })

  td = document.createElement("td")
  tr.appendChild(td)

  entry.wikidata.forEach(d => {
    let a = document.createElement('a')
    a.appendChild(document.createTextNode(d.itemLabel.value))
    a.href = d.item.value
    td.appendChild(a)
    td.appendChild(document.createElement('br'))
  })

  td = document.createElement("td")
  tr.appendChild(td)

  entry.osm.forEach(d => {
    let a = document.createElement('a')
    a.appendChild(document.createTextNode(d.tags.name || (d.type + '/' + d.id)))
    a.href = 'https://openstreetmap.org/' + d.type + '/' + d.id
    td.appendChild(a)
    td.appendChild(document.createElement('br'))
  })

  td = document.createElement("td")
  tr.appendChild(td)

  entry.wmc.forEach(d => {
    let a = document.createElement('a')
    a.appendChild(document.createTextNode(d.title))
    a.href = 'https://commons.wikimedia.org/wiki/' + d.title
    td.appendChild(a)
    td.appendChild(document.createElement('br'))
  })

  document.getElementById("data").appendChild(tr)
}

function add (type, id, entry) {
  if (!(id in data)) {
    data[id] = {
      bda: [],
      wikidata: [],
      osm: [],
      wmc: []
    }
  }

  data[id][type].push(entry)
}

window.onload = () => {
  async.parallel([
    done => {
      fetch('data/bda.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => {
            add('bda', entry.ObjektID, entry)
          })

          done()
        })
    },
    done => {
      fetch('data/wikidata.json')
        .then(res => res.json())
        .then(json => {
          json.results.bindings.forEach(entry => add('wikidata', entry.ID.value, entry))

          done()
        })
    },
    done => {
      fetch('data/overpass.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => add('osm', entry.tags["ref:at:bda"], entry))

          done()
        })
    },
    done => {
      fetch('data/wikimedia_commons.json')
        .then(res => res.json())
        .then(json => {
          json.forEach(entry => add('wmc', entry.id, entry))

          done()
        })
    }
  ],
  err => {
    for (let k in data) {
      show(k)
    }
  })
}
