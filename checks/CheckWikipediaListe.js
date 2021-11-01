const escHTML = require('html-escape')

const STATUS = require('../src/status.js')
const Check = require('../src/Check.js')
const printAttrList = require('../src/printAttrList.js')

class CheckWikipediaListe extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob) {
    if (!ob.data.wikipedia) {
      return ob.load('wikipedia', { list: ob.dataset.wikipediaList, id: (ob.dataset.wikipediaListPrefix ? ob.dataset.wikipediaListPrefix : '') + ob.id })
    }

    if (ob.data.wikipedia.length === 0) {
      return ob.message('wikipedia', STATUS.ERROR, 'Seite nicht gefunden')
    }

    const found = ob.data.wikipedia

    if (found.length) {
      let msg = '<a target="_blank" href="' + escHTML(found[0].url) + '">Wikipedia Liste</a>:'

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

      if (this.options.latitudeField && this.options.longitudeField) {
        if (found[0][this.options.latitudeField] && found[0][this.options.longitudeField]) {
          attrList.push({
            key: 'coordinates',
            title: 'Koordinaten',
            text: parseFloat(found[0][this.options.latitudeField]).toFixed(5) + ', ' + parseFloat(found[0][this.options.longitudeField]).toFixed(5),
            value: { latitude: found[0][this.options.latitudeField], longitude: found[0][this.options.longitudeField] },
            link: 'https://openstreetmap.org/?mlat=' + found[0][this.options.latitudeField] + '&mlon=' + found[0][this.options.longitudeField] + '#map=19/' + found[0][this.options.latitudeField] + '/' + found[0][this.options.longitudeField]
          })
        }
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
        ob.load('commons', { title: 'Category:' + found[0].Commonscat })
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

      if (this.options.articleField) {
        if (found[0][this.options.articleField]) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf einen Wikipedia Artikel: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(found[0][this.options.articleField].replace(/ /g, '_')) + '">' + escHTML(found[0][this.options.articleField]) + '</a>')
        } else {
          if (ob.data.wikidata && ob.data.wikidata.length) {
            const wikidataEntry = ob.data.wikidata[0]
            if (wikidataEntry.sitelinks && 'dewiki' in wikidataEntry.sitelinks) {
              ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf einen Wikipedia Artikel, sollte sein: <tt>Artikel = ' + escHTML(wikidataEntry.sitelinks.dewiki.title) + '</tt>')
            }
          }
        }
      }

      if (this.options.wikidataField) {
        if (!ob.data.wikidata) {
          // no wikidata entry loaded -> try this
          if (found[0][this.options.wikidataField]) {
            ob.load('wikidata', { key: 'id', id: found[0][this.options.wikidataField] })
          }
        } else if (!ob.data.wikidata.length) {
          // no wikidata entry found
        } else if (found[0][this.options.wikidataField] === ob.data.wikidata[0].id) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen gültigen Verweis auf den Wikidata Eintrag.')
        } else if (found[0][this.options.wikidataField]) {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat einen ungültigen Verweis auf einen Wikidata Eintrag: <tt>' + escHTML(found[0][this.options.wikidataField]) + '</tt>')
        } else {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf den Wikidata Eintrag, sollte sein: <tt>' + escHTML(this.options.wikidataField) + ' = ' + escHTML(ob.data.wikidata[0].id) + '</tt>')
        }
      }

      return true
    } else {
      return ob.message('wikipedia', STATUS.ERROR, 'Nicht gefunden')
    }
  }
}

module.exports = options => new CheckWikipediaListe(options)
