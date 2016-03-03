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
        this.client = redis.createClient()

        if ('redis' in Settings && 'auth' in Settings.redis) {
            this.client.auth(Settings.redis.auth)
        }
    }
}

export default new Database
