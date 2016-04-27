// import BlacklistModule from '../modules/blacklist'
// import LoveModule from '../modules/love'
// import UsercommandsModule from '../modules/usercommands'
import Database from './database'
import Cache from './cache'
import Log from './log'

let MODULES = ['debug','blacklist','love','commands','walls','subscriptions']

class ModuleManager {
    constructor () {
        this.modules = []
    }

    load () {
        this.modules = MODULES.map(module => new module)

        this.modules.forEach(module => {
            module.enable()
        })
    }

    get (moduleName) {
        if (!moduleName) {
            return this.modules
        }

        return this.modules.find(module => module.constructor.name === moduleName)
    }

    async getConfig (channel) {
        let config = Cache.get(`users:${channel}:moduleconfig`)

        if (config === undefined) {
            // config = JSON.parse(await Database.client.getAsync(`users:${channel}:moduleconfig`))
            config = await this.loadConfig(channel)
        }

        return config
    }

    async loadConfig (channel) {
        let config = await Database.client.getAsync(`users:${channel}:moduleconfig`)
        
        if (config) {
            let cacheKey = `moduleconfig.${channel}`

            config = JSON.parse(config)

            Cache.set(cacheKey, config, 24 * 60 * 3600)
            Cache.on('expired', (key, value) => {
                if (key === cacheKey) {
                    this.loadConfig(channel)
                        .catch(e => Log.error(e.stack))
                }
            })

            return config
        }
    }

    async setConfig (channel, data) {
        let resp = await Database.client.setAsync(`users:${channel}:moduleconfig`, JSON.stringify(data))
    }
    
    async setModuleConfig (channel, module, data) {
        let currentData = await this.getConfig(channel)
        currentData[module] = data
        let resp = await Database.client.setAsync(`users:${channel}:moduleconfig`, JSON.stringify(currentData))
    }
}

/*
    {
        label: 'The emote to use',
        default: '<3',
        placeholder: '<3',
        constraint: {
            minLength: 1
        }
    }
*/
export class ModuleSetting {
    constructor (options) {
        const defaults = {
            type: this.guessType(options)
        }

        this.settings = Object.assign(defaults, options)
    }

    guessType (options) {
        let type = 'string'

        if (options.type) {
            return options.type
        }

        if ('constraint' in options) {
            if ('min' in options.constraint || 'max' in options.constraint) {
                return 'number'
            }
        }

        if ('default' in options && typeof options.default === 'boolean') {
            return 'checkbox'
        }

        return type
    }

    get value () {
        return this.settings.value || this.settings.default
    }

    set value (value) {
        if (this.settings.type === 'number') {
            value = parseInt(value, 10)
        }

        this.settings.value = value
    }
}

export default new ModuleManager

MODULES = MODULES.map(module => require(`../modules/${module}`).default)
export {MODULES as MODULES}
