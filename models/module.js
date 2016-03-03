// import BlacklistModule from '../modules/blacklist'
// import LoveModule from '../modules/love'
// import UsercommandsModule from '../modules/usercommands'
import Database from './database'
import Cache from './cache'
import Log from './log'

let MODULES = ['blacklist','love','usercommands']

class ModuleManager {
    constructor () {
        this.modules = []
    }

    load () {
        this.modules = MODULES.map(module => new module)

        this.modules.forEach(function (module) {
            module.enable()
        })
    }

    get (moduleName) {
        return this.modules.find(module => module.constructor.name === moduleName)
    }

    async loadConfig (channel) {
        let config = await Database.client.getAsync('moduleconfig_' + channel)
        
        if (config) {
            let cacheKey = 'moduleconfig.' + channel

            config = JSON.parse(config)

            Cache.set(cacheKey, config, 24 * 60 * 3600)
            Cache.on('expired', (key, value) => {
                if (key === cacheKey) {
                    this.loadConfig(channel)
                        .catch(e => Log.error(e.stack))
                }
            })
        }
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
        this.settings = options
    }

    get value () {
        return this.settings.value || this.settings.default
    }

    set value (value) {
        this.settings.value = value
    }
}

export default new ModuleManager

MODULES = MODULES.map(module => require('../modules/' + module).default)
export {MODULES as MODULES}
