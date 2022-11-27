const load = require('./load')

const get = {
  items (dataset, options, callback) {
    if (!dataset._data) {
      return load(dataset, (err, json, stat) => {
        dataset._data = json
        dataset.fileStat = stat

        get.items(dataset, options, callback)
      })
    }

    if ('id' in options) {
      let result

      if (dataset.refData.idField) {
        result = dataset._data.filter(item => item[dataset.refData.idField] == options.id)
      } else {
        result = [dataset._data[options.id]]
      }

      callback(null, result)
    } else if ('filter' in options) {
      let result = dataset._data.filter(item => {
        for (let k in options.filter) {
          if (item[k] != options.filter[k]) {
            return false
          }
        }
        return true
      })

      if (options.count) {
        const offset = parseInt(options.offset || 0)
        const count = parseInt(options.count)
        result = result.slice(offset, offset + count)
      }

      callback(null, result)
    } else {
      let result = dataset._data

      if (options.count) {
        const offset = parseInt(options.offset || 0)
        const count = parseInt(options.count)
        result = result.slice(offset, offset + count)
      }

      callback(null, result)
    }
  },

  item (dataset, id, callback) {
    get.items(dataset, { id },
      (err, data, stat) => callback(err, data.length ? data[0] : null, stat)
    )
  },

  values (dataset, key, callback) {
    get.items(dataset, {}, (err, data, stat) => {
      if (err) { return callback(err) }

      const result = {}
      data.forEach(item => {
        result[item[key]] = null
      })

      callback(null, Object.keys(result).sort(), this.fileStat)
    })
  },

  info (dataset, options, callback) {
    get.items(dataset, options, (err, data, stat) => {
      if (err) { return callback(err) }

      result = {
        count: data.length,
        ctime: stat.ctime,
        mtime: stat.mtime,
        size: stat.size
      }

      callback(null, result, stat)
    })
  }
}

module.exports = get
