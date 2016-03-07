import BaseModule from './base'
import Commands from '../models/command'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import EventManager from '../models/event'

export default class CommandsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'Commands'
        this.global = true

        this.commands['add'] = Commands.rawCommand(this, this.add, {
            description: 'Add a command'
        })

        this.commands['remove'] = Commands.rawCommand(this, this.remove, {
            description: 'Remove a command'
        })

        this.events = {
            'message': this.onMessage
        }
    }

    async onMessage (data) {
        if (!data.command) {
            return
        }

        let last_param = data.params[data.params.length - 1],
            response = '',
            hasMention = false,
            cmd = null

        cmd = await Database.client.hgetAsync(`users:${data.channel.name}:commands`, data.command)
        cmd = JSON.parse(cmd)

        if (!cmd || (cmd.mod && (!data.user.isMod() && !data.user.isAdmin()))) {
            return
        }

        if (last_param && last_param.length > 1 && last_param[0] === '@') {
            hasMention = true
            response = `${last_param}, `
            data.params.pop()
        }
        
        // TODO: maybe turn plaintext into an actual module
        if (cmd.command && cmd.command !== 'plaintext') {
            EventManager.emit(`command:${cmd.command}`, data)
        } else if (cmd.value) {
            response += cmd.value

            if (cmd.me && !hasMention) {
                Chat.action(data.channel.name, response)
            } else {
                Chat.say(data.channel.name, response)
            }
        }
    }

    async add (data) {
        if (data.params.length < 2) {
            return
        }

        data.params[0] = data.params[0].replace(/^!/, '')
        // TODO: maybe add check for special chars, but for now allow everything
        // to see how that works out. Let people use whatever they want.
        
        let key = `users:${data.channel.name}:commands`,
            value, cmd, mod, me

        value = await Database.client.hgetAsync(key, data.params[0])
        cmd = JSON.parse(value)

        if (!cmd) {
            cmd = {
                mod: false,
                me: false
            }
        }

        cmd.command = 'plaintext'
        cmd.value = data.params.slice(1).join(' ')

        Database.client.hset(key, data.params[0], JSON.stringify(cmd))
        Chat.whisper(data.user.name, 'Command updated! BloodTrail')
    }

    remove () {}
}
