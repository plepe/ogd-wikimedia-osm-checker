# ogd-wikimedia-osm-checker
Vergleiche die Einträge verschiedener OGD (Open Government Data) Datensätze mit Wikidata, Wikipedia, Wikimedia Commons und OpenStreetMap.

Aktuell verfügbare Datensätze:
* [Denkmalliste des österr. Bundesdenkmalamtes](https://bda.gv.at/denkmalverzeichnis/#denkmalliste-gemaess-3-dmsg)
* [Kunstwerke im öff. Raum (Kulturgut Wien)](https://www.data.gv.at/katalog/dataset/stadt-wien_kunstwerkeimffentlichenraumwien)
* [Wiener Gemeindebauten (Wiener Wohnen)](https://www.wienerwohnen.at/wiener-gemeindebau/gemeindebaubeschreibungen.html)

Der Checker läuft auf https://www.openstreetmap.at/checker

Ein Screencast mit einer Anleitung findet sich hier: https://www.youtube.com/watch?v=e9Is-3ssA7U

## Installation
```
git clone https://github.com/plepe/ogd-wikimedia-osm-checker
cd ogd-wikimedia-osm-checker
npm install # install dependencies, link code
npm run download # download current list of memorial sites to data/bda.json
npm start # start internal web server on port 8080
```

Browse to http://localhost:8080

### Run with docker
```sh
git clone https://github.com/plepe/ogd-wikimedia-osm-checker
cd ogd-wikimedia-osm-checker
docker build -t skunk/ogd-wikimedia-osm-checker .
docker run -p 8080:8080 -d skunk/ogd-wikimedia-osm-checker
```

Browse to http://localhost:8080

## Create an additional dataset
### Dataset
Create a file `foobar.yaml` in the `datasets/` directory and add it to
`datasets/index.txt`. You can use [minimal.yaml](minimal.yaml) as basis or
[example.yaml](example.yaml) (which has a full documentation of this file).

### Downloader [optional]
If you need a special downloader, create a file in `src/datasets`:
`DownloadExample.js` and add it to `src/datasets/download.js`.

This should load the reference data and create a JSON file in the `data`
folder.

```js
const fetch = require('node-fetch')
const fs = require('fs')

module.exports = function downloadExample (callback) {
  fetch('https://example.com/dataset.json')
    .then(response => response.json())
    .then(data => fs.writeFile('data/example.json', JSON.stringify(data), callback))
}
```

## Development
If you modify the code, you can run the following command. This will compile the code with debugging symbols and will re-compile as soon as the source code changed.
```
npm run watch
```

## Author
* Stephan Bösch-Plepelits
