const async = require('async')
const forEach = require('foreach')

const wikidataToOsm = require('./wikidataToOsm.json')

module.exports = {
  init (callback) {
    async.eachOf(wikidataToOsm, (d, property, done) => {
      if (d.file) {
        fetch('data/' + d.file)
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

  getMissingTags (ob) {
    const missTags = []

    if (ob.data.wikidata && ob.data.wikidata.length) {
      const wikidata = ob.data.wikidata[0]

      for (const k in wikidataToOsm) {
        const d = wikidataToOsm[k]

        let values = wikidata.claims[k]
        if (values) {
          missTags.push(d.tag + '=' + values.map(v => {
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
                      null
                  }
                default:
                  return v.mainsnak.datavalue.value
              }
            }
          }).filter(v => v).join(';'))

          if (d.tagLabel) {
            missTags.push(d.tagLabel + '=' + wikidata.claims[k]
              .map(v => v.text)
              .filter(v => v)
              .join(';')
            )
          }

          if (d.additionalTags) {
            forEach(d.additionalTags, (v, k) => {
              missTags.push(k + '=' + v)
            })
          }
        }
      }
    }

    return missTags
  }
}
