import BaseModule from './base'
import Commands from '../models/command'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import EventManager from '../models/event'

export default class UsercommandsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'User Commands'
        this.global = true
        this.events = {
            'message': this.onMessage
        }
    }

    async onMessage (data) {
        if (!data.command) {
            return
        }

        let key = 'commands_' + data.channel.name,
            last_param = data.params[data.params.length - 1],
            response = '',
            hasMention = false,
            cmd = null

        cmd = await Database.client.hgetAsync(key, data.command)
        cmd = JSON.parse(cmd)

        if (!cmd) {
            return
        }

        if (cmd.mod && (!data.user.isMod() && !data.user.isAdmin())) {
            return
        }

        if (last_param && last_param.length > 1 && last_param[0] === '@') {
            hasMention = true
            response = `${last_param}, `
            data.params.pop()
        }
        
        if (cmd.command) {
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
}
