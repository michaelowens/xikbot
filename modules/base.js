import EventManager from '../models/event'
import Log from '../models/log'
import Cache from '../models/cache'

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

    isEnabledForChannel(channel) {
        let config = Cache.get('moduleconfig.' + channel)

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
        for (var event in this.events) {
            if (!(event in this.wrappedEvents)) {
                this.events[event] = this.events[event].bind(this)
                this.wrappedEvents[event] = this.wrapCommand(event)
            }

            EventManager.on(event, this.wrappedEvents[event])
        }
        this.wrappedEvents = true

        for (var command in this.commands) {
            this.commands[command].enable(command)
        }

        this.enabled = true
    }

    disable () {
        for (var event in this.events) {
            EventManager.removeListener(event, this.events[event])
        }

        for (var command in this.commands) {
            this.commands[command].disable(command)
        }

        this.enabled = false
    }
}
