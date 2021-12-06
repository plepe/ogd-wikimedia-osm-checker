const escHTML = require('html-escape')

const STATUS = require('../status.js')
const Check = require('../Check.js')
const printAttrList = require('../printAttrList.js')
const createGeoLink = require('../createGeoLink')

class CheckWikipediaListe extends Check {
  // result:
  // - null/false: not finished yet
  // - true: check is finished
  check (ob, dataset) {
    if (!dataset.wikipediaList) {
      return true
    }

    if (!ob.data.wikipedia) {
      return ob.load('wikipedia', { list: dataset.wikipediaList.list, id: (dataset.wikipediaList.idPrefix ? dataset.wikipediaList.idPrefix : '') + ob.id })
    }

    if (ob.data.wikipedia.length === 0) {
      return ob.message('wikipedia', STATUS.ERROR, 'Seite nicht gefunden')
    }

    const found = ob.data.wikipedia

    if (found.length) {
      const attrList = []

      let showFields = Object.keys(found[0])
      if (dataset.wikipediaList.showFields) {
        showFields = dataset.wikipediaList.showFields
      }
      showFields.forEach(
        fieldId => {
          if (found[0][fieldId]) {
            attrList.push({
              title: fieldId,
              text: found[0][fieldId]
            })
          }
        }
      )

      if (dataset.wikipediaList.latitudeField && dataset.wikipediaList.longitudeField) {
        if (found[0][dataset.wikipediaList.latitudeField] && found[0][dataset.wikipediaList.longitudeField]) {
          attrList.push({
            key: 'coordinates',
            title: 'Koordinaten',
            html: createGeoLink({ latitude: found[0][dataset.wikipediaList.latitudeField], longitude: found[0][dataset.wikipediaList.longitudeField] })
          })
        }
      }

      let msg = '<a target="_blank" href="' + escHTML(found[0].url) + '">Wikipedia Liste</a>'
      if (attrList.length) {
        msg += ':' + printAttrList(attrList)
      }
      ob.message('wikipedia', STATUS.SUCCESS, msg)

      if (dataset.wikipediaList.pictureField) {
        const field = dataset.wikipediaList.pictureField
        const requestField = dataset.wikipediaList.pictureRequestField

        if (found[0][field] && found[0][requestField]) {
          ob.message('wikipedia', STATUS.WARNING, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0][field].replace(/ /g, '_')) + '">Bild</a>, aber mit Bilderwunsch: ' + escHTML(found[0][requestField]))
        } else if (found[0][field]) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat ein <a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + escHTML(found[0][field].replace(/ /g, '_')) + '">Bild</a>')
        } else {
          ob.message('wikipedia', STATUS.WARNING, 'Liste hat kein Bild.')
        }
      }

      if (dataset.wikipediaList.commonsField) {
        const field = dataset.wikipediaList.commonsField
        if (found[0][field]) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf eine Commons Kategorie: <a target="_blank" href="https://commons.wikimedia.org/wiki/Category:' + escHTML(found[0][field].replace(/ /g, '_')) + '">' + escHTML(found[0][field]) + '</a>')
          ob.load('commons', { title: 'Category:' + found[0][field] })
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
      }

      if (dataset.wikipediaList.articleField) {
        if (found[0][dataset.wikipediaList.articleField]) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen Verweis auf einen Wikipedia Artikel: <a target="_blank" href="https://de.wikipedia.org/wiki/' + escHTML(found[0][dataset.wikipediaList.articleField].replace(/ /g, '_')) + '">' + escHTML(found[0][dataset.wikipediaList.articleField]) + '</a>')
        } else {
          if (ob.data.wikidataSelected) {
            const wikidataEntry = ob.data.wikidataSelected
            if (wikidataEntry.sitelinks && 'dewiki' in wikidataEntry.sitelinks) {
              ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf einen Wikipedia Artikel, sollte sein: <tt>Artikel = ' + escHTML(wikidataEntry.sitelinks.dewiki.title) + '</tt>')
            }
          }
        }
      }

      if (dataset.wikipediaList.wikidataField) {
        if (!ob.data.wikidata) {
          // no wikidata entry loaded -> try this
          if (found[0][dataset.wikipediaList.wikidataField]) {
            ob.load('wikidata', { key: 'id', id: found[0][dataset.wikipediaList.wikidataField] })
          }
        } else if (!ob.data.wikidataSelected) {
          // no wikidata entry found
        } else if (found[0][dataset.wikipediaList.wikidataField] === ob.data.wikidataSelected.id) {
          ob.message('wikipedia', STATUS.SUCCESS, 'Liste hat einen gültigen Verweis auf den Wikidata Eintrag.')
        } else if (found[0][dataset.wikipediaList.wikidataField]) {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat einen ungültigen Verweis auf einen Wikidata Eintrag: <tt>' + escHTML(found[0][dataset.wikipediaList.wikidataField]) + '</tt>')
        } else {
          ob.message('wikipedia', STATUS.ERROR, 'Liste hat keinen Verweis auf den Wikidata Eintrag, sollte sein: <tt>' + escHTML(dataset.wikipediaList.wikidataField) + ' = ' + escHTML(ob.data.wikidataSelected.id) + '</tt>')
        }
      }

      return true
    } else {
      return ob.message('wikipedia', STATUS.ERROR, 'Nicht gefunden')
    }
  }
}

module.exports = options => new CheckWikipediaListe(options)
