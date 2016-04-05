import EventManager from '../models/event'
import ModuleManager from '../models/module'
import Log from '../models/log'
import Cache from '../models/cache'
import Database from '../models/database'

export default class BaseModule {
    constructor () {
        this.title = ''
        this.description = ''
        this.global = false
        this.enabled = false
        this.commands = {}
        this.settings = {}
        this.wrappedEvents = {}
        this.events = {}
    }

    async getModuleSettingsValues (channel) {
        let channelConfig = await ModuleManager.getConfig(channel),
            defaults = {}

        channelConfig = channelConfig[this.constructor.name].settings || {}

        for (let setting in this.settings) {
            defaults[setting] = this.settings[setting].settings.default
        }

        return Object.assign(defaults, channelConfig)
    }

    async getModuleSettings (channel) {
        let channelConfig = await ModuleManager.getConfig(channel),
            config = {}

        config = Object.assign({}, this.settings) // channelConfig[this.constructor.name].settings || {}

        for (let setting in config) {
            if (this.constructor.name in channelConfig && 'settings' in channelConfig[this.constructor.name] && setting in channelConfig[this.constructor.name].settings) {
                config[setting].settings.value = channelConfig[this.constructor.name].settings[setting]
            }
        }

        return config
    }

    isEnabledForChannel(channel) {
        let config = Cache.get(`moduleconfig.${channel}`)

        if (this.global) {
            return true
        }

        if (!config || !(this.constructor.name in config) || !config[this.constructor.name].enabled) {
            return false
        }

        return true
    }

    wrapCommand (event) {
        return (data) => {
            let response

            if (!this.isEnabledForChannel(data.channel.name)) {
                return
            }

            try {
                response = this.events[event](data)
            } catch (e) {
                Log.error(e.stack)
            }

            if (response instanceof Promise) {
                response.catch(e => Log.error(e.stack))
            }
        }
    }

    enable () {
        for (let event in this.events) {
            if (!(event in this.wrappedEvents)) {
                this.events[event] = this.events[event].bind(this)
                this.wrappedEvents[event] = this.wrapCommand(event)
            }

            EventManager.on(event, this.wrappedEvents[event])
        }
        this.wrappedEvents = true

        for (let command in this.commands) {
            this.commands[command].enable(command)
        }

        this.enabled = true
    }

    disable () {
        for (let event in this.events) {
            EventManager.removeListener(event, this.events[event])
        }

        for (let command in this.commands) {
            this.commands[command].disable(command)
        }

        this.enabled = false
    }

    async saveChannelSettings (channel) {
        channel = channel.replace(/^#/, '')

        let data = {
            enabled: this.isEnabledForChannel(channel),
            settings: {}
        }

        for (let setting in this.settings) {
            if ('value' in this.settings[setting].settings && this.settings[setting].settings.value) {
                data.settings[setting] = this.settings[setting].settings.value
            }
        }

        ModuleManager.setModuleConfig(channel, this.constructor.name, data).catch(e => Log.error(e.stack))
    }

    phrase (str, data) {
        return str.replace(/{([a-z0-9-_]+)}/gi, (match, key) => {
            return data[key] || match
        })
    }
}
