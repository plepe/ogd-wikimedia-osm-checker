const timestamp = require('./timestamp')

module.exports = class Cache {
  constructor () {
    this.cache = {}
  }

  get (id, options = {}) {
    const cacheId = JSON.stringify(id)

    if (cacheId in this.cache && (!options.reload || this.cache[cacheId].ts > options.reload)) {
      return this.cache[cacheId].data
    }

    return undefined
  }

  add (id, data) {
    const cacheId = JSON.stringify(id)

    this.cache[cacheId] = {
      ts: timestamp(),
      data
    }
  }
}
