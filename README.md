# bundesdenkmal-checker
 Vergleiche die Liste der Baudenkmäler des Österreichischen Bundesdenkmalamtes mit Wikidata, Wikipedia, Wikimedia Commons und OpenStreetMap.

## Installation
```
git clone https://github.com/plepe/bundesdenkmal-checker
cd bundesdenkmal-checker
npm install # install dependencies, link code
npm run update # download current list of memorial sites to data/bda.json
npm start # start internal web server on port 8080
```

Browse to http://localhost:8080

## Development
If you modify the code, you can run the following command. This will compile the code with debugging symbols and will re-compile as soon as the source code changed.
```
npm run watch
```

## Author
* Stephan Bösch-Plepelits
