const async = require('async')
const forEach = require('foreach')

const wikidataToOsm = require('./wikidataToOsm.json')

module.exports = {
  init (_app, callback) {
    async.eachOf(wikidataToOsm, (d, property, done) => {
      if (d.file) {
        global.fetch('data/' + d.file)
          .then(res => res.json())
          .then(json => {
            d.mapping = json
            done()
          })
      } else {
        done()
      }
    },
    callback)
  },

  addTags (ob, osmItem) {
    const result = {}

    if (ob.data.wikidataSelected) {
      const wikidata = ob.data.wikidataSelected

      for (const k in wikidataToOsm) {
        const d = wikidataToOsm[k]

        let values = wikidata.claims[k]
        const kPath = k.split(/\./)
        if (kPath.length === 2 && kPath[0] in wikidata.claims) {
          values = []
          wikidata.claims[kPath[0]].forEach(e => {
            if (e.qualifiers && kPath[1] in e.qualifiers) {
              e.qualifiers[kPath[1]].forEach(v => {
                values.push({ mainsnak: v })
              })
            }
          })
        }

        if (values) {
          result[d.tag] = values.map(v => {
            if (d.mapping) {
              if (v.mainsnak.datavalue.value.id in d.mapping) {
                return d.mapping[v.mainsnak.datavalue.value.id].tag
              }
            } else {
              switch (v.mainsnak.datavalue.type) {
                case 'wikibase-entityid':
                  return v.mainsnak.datavalue.value.id
                case 'time':
                  switch (v.mainsnak.datavalue.value.precision) {
                    case 7:
                      return 'C' + v.mainsnak.datavalue.value.time.substr(1, 2)
                    case 8:
                      return v.mainsnak.datavalue.value.time.substr(1, 4) + 's'
                    case 9:
                      return v.mainsnak.datavalue.value.time.substr(1, 4)
                    case 10:
                      return v.mainsnak.datavalue.value.time.substr(1, 7)
                    case 11:
                      return v.mainsnak.datavalue.value.time.substr(1, 10)
                    default:
                      return v.mainsnak.datavalue.value
                  }
                default:
                  return v.mainsnak.datavalue.value
              }
            }
          }).filter(v => v).join(';')

          if (d.tagLabel) {
            result[d.tagLabel] = wikidata.claims[k]
              .map(v => v.text)
              .filter(v => v)
              .join(';')
          }

          if (d.additionalTags) {
            forEach(d.additionalTags, (v, k) => {
              result[k] = v
            })
          }
        }
      }
    }

    return result
  }
}
