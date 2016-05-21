import redis from 'redis'
import promisifyAll from 'es6-promisify-all'
import Settings from './settings'
import bluebird from 'bluebird'

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

class Database {
  constructor () {
    this.client = null
  }

  connect () {
    this.client = redis.createClient(Settings.redis || {})
  }

  quit () {
    if (!this.client) {
      return
    }
    this.client.quit()
    this.client = null
  }
}

export default new Database
