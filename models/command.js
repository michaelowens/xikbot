import EventManager from './event'
import ModuleManager from './module'
import Log from './log'

class Commands {
    rawCommand (scope, callback, options) {
        return new Command(scope, options, callback)
    }

    multiCommand (scope, options) {
        return new MultiCommand(scope, options)
    }
}

export class Command {
    constructor (scope, options, callback) {
        if (!options) {
            options = scope
            scope = this
        }
        this.options = options
        this.scope = scope
        this.handler = this.handleCommand.bind(this)
        this.callback = callback.bind(scope)
    }

    handleCommand (data) {
        let response

        if (!ModuleManager.get(this.scope.constructor.name).isEnabledForChannel(data.channel.name)) {
            return
        }

        try {
            response = this.callback(data)
        } catch (e) {
            Log.error(e.stack)
        }

        if (response instanceof Promise) {
            response.catch(e => Log.error(e.stack))
        }
    }

    enable () {
        EventManager.on('command:' + this.options.command, this.handler)
    }

    disable () {
        EventManager.removeListener('command:' + this.options.command, this.handler)
    }
}

export class MultiCommand {
    constructor (scope, options) {
        if (!options) {
            options = scope
            scope = this
        }
        this.options = options
        this.scope = scope
        this.handler = this.handleCommand.bind(this)
    }

    handleCommand (data) {
        let command = null,
            cb = null,
            response = null

        if (!ModuleManager.get(this.scope.constructor.name).isEnabledForChannel(data.channel.name)) {
            return
        }

        if (data.params[0]) {
            let subcommand = data.params[0]

            if (subcommand in this.options.commands) {
                command = subcommand
            }
        }

        if (!command && '_' in this.options.commands) {
            command = '_'
        }

        if (!command) {
            return
        }

        cb = this.options.commands[command].callback.bind(this.scope)

        try {
            response = cb(data)
        } catch (e) {
            Log.error(e.stack)
        }

        if (response instanceof Promise) {
            response.catch(e => Log.error(e.stack))
        }
    }

    enable () {
        EventManager.on('command:' + this.options.command, this.handler)
    }

    disable () {
        EventManager.removeListener('command:' + this.options.command, this.handler)
    }
}

export default new Commands
