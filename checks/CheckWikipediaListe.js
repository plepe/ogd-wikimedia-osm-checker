const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const parseMediawikiTemplate = require('parse-mediawiki-template')
const Check = require('../src/Check.js')
const printAttrList = require('../src/printAttrList.js')

class CheckWikipediaListe extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    let title
    if (!ob.data.wikipedia) {
      if (ob.dataset.wikipediaListeTitle) {
        title = ob.dataset.wikipediaListeTitle(ob)
        if (!ob.data.wikipedia) {
          return ob.load('wikipedia', { title })
        }
      } else {
        return ob.load('wikipedia', { search: 'insource:/' + ob.dataset.idField + ' *= *' + ob.id + '[^0-9]/ intitle:' + ob.dataset.wikipediaListeSearchTitle })
      }
    }

    if (ob.data.wikipedia.length === 0) {
      return ob.message('wikipedia', STATUS.ERROR, 'Seite nicht gefunden')
    }

    title = ob.data.wikipedia[0].title
    const listEntries = parseMediawikiTemplate(ob.data.wikipedia[0].wikitext, this.options.template)
    const found = listEntries.filter(e => e[this.options.idField] === ob.id)

    if (found.length) {
      let msg = '<a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '#' + ob.dataset.wikipediaListeAnchor(ob) + '">Wikipedia Liste</a>:'

      const attrList = this.options.showFields.map(
        fieldId => {
          if (found[0][fieldId]) {
            return {
              title: fieldId,
              text: found[0][fieldId]
            }
          }
        }
      )

      if (found[0].Breitengrad && found[0].Längengrad) {
        attrList.push({
          key: 'coordinates',
          title: 'Koordinaten',
          text: parseFloat(found[0].Breitengrad).toFixed(5) + ', ' + parseFloat(found[0].Längengrad).toFixed(5),
          value: {latitude: found[0].Breitengrad, longitude: found[0].Längengrad},
          link: 'https://openstreetmap.org/?mlat=' + found[0].Breitengrad + '&mlon=' + found[0].Längengrad + '#map=19/' + found[0].Breitengrad + '/' + found[0].Längengrad
        })
      }
      msg += printAttrList(attrList)
      ob.message('wikipedia', STATUS.SUCCESS, msg)

      if (found[0].Foto && found[0].Bilderwunsch) {
        ob.message('wikipedia', STATUS.WARNING, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0].Foto.replace(/ /g, '_')) + '">Bild</a>, aber mit Bilderwunsch: ' + escHTML(found[0].Bilderwunsch))
      } else if (found[0].Foto) {
        ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0].Foto.replace(/ /g, '_')) + '">Bild</a>')
      } else {
        ob.message('wikipedia', STATUS.WARNING, 'Liste hat kein Bild.')
      }

      if (found[0].Commonscat) {
        ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf eine Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + escHTML(found[0].Commonscat.replace(/ /g, '_')) + '">' + escHTML(found[0].Commonscat) + '</a>')
      } else {
        const categories = ob.data.commons && ob.data.commons.filter(page => page.title.match(/^Category:/))
        if (!categories || !categories.length) {
          ob.message('wikipedia', STATUS.WARNING, 'Liste hat keinen Verweis auf eine Commons Kategorie.')
        } else if (categories.length === 1) {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf eine Commons Kategorie, sollte sein: <tt>Commonscat = ' + escHTML(categories[0].title.slice(9)) + '</tt>')
        } else if (categories.length) {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf eine Commons Kategorie.')
        }
      }

      if (found[0].Artikel) {
        ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf einen Wikipedia Artikel: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(found[0].Artikel.replace(/ /g, '_')) + '">' + escHTML(found[0].Artikel) + '</a>')
      } else {
        if (ob.data.wikidata && ob.data.wikidata.length) {
          let wikidataEntry = ob.data.wikidata[0]
          if (wikidataEntry.sitelinks && 'dewiki' in wikidataEntry.sitelinks) {
            ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf einen Wikipedia Artikel, sollte sein: <tt>Artikel = ' + escHTML(wikidataEntry.sitelinks.dewiki.title) + '</tt>')
          }
        }
      }

      if (this.options.wikidataField) {
        if (!ob.data.wikidata) {
          // no wikidata entry loaded -> try this
          if (found[0][this.options.wikidataField]) {
            ob.load('wikidata', { key: 'id', id: found[0][this.options.wikidataField] })
          }
        }
        else if (!ob.data.wikidata.length) {
          // no wikidata entry found
        }
        else if (found[0][this.options.wikidataField] === ob.data.wikidata[0].id) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen gültigen Verweis auf den Wikidata Eintrag.')
        }
        else if (found[0][this.options.wikidataField]) {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat einen ungültigen Verweis auf einen Wikidata Eintrag: <tt>' + escHTML(found[0][this.options.wikidataField]) + '</tt>')
        }
        else {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf den Wikidata Eintrag, sollte sein: <tt>' + escHTML(this.options.wikidataField) + ' = ' + escHTML(ob.data.wikidata[0].id) + '</tt>')
        }
      }

      return true
    } else {
      return ob.message('wikipedia', STATUS.ERROR, 'Nicht gefunden in: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(title.replace(/ /g, '_')) + '">Wikipedia Liste</a>')
    }
  }
}

module.exports = options => new CheckWikipediaListe(options)
