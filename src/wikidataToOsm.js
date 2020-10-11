const async = require('async')

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
    let missTags = []

    if (ob.data.wikidata && ob.data.wikidata.length) {
      let wikidata = ob.data.wikidata[0]

      for (let k in wikidataToOsm) {
        let d = wikidataToOsm[k]

        if (wikidata.claims[k]) {
          missTags.push(d.tag + "=" + wikidata.claims[k].map(v => {
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
                      return 'C' + parseInt(v.mainsnak.datavalue.value.time.substr(1, 2)) + 1
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
        }
      }
    }

    return missTags
  }
}
