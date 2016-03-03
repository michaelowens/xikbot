import BaseModule from './base'
import Commands from '../models/command'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import {RateLimiter} from 'limiter'
import seedrandom from 'seedrandom'
import {ModuleSetting} from '../models/module'

export const SETTINGS = {
    'emote': new ModuleSetting({
        label: 'The emote to use',
        default: '<3',
        placeholder: '<3',
        constraint: {
            minLength: 1
        }
    })
}

export default class LoveModule extends BaseModule {
    constructor () {
        super()

        this.limiter = new RateLimiter(2, 30000)

        this.commands = Commands.rawCommand(this, this.love, {
            command: 'love',
            description: 'Calculate the love between 2 people'
        })
    }

    love (message) {
        if (!message.user.isMod() && !message.user.isAdmin() && !this.limiter.tryRemoveTokens(1)) {
            return
        }

        let user_from = message.user.name,
            user_to = message.params.join(' ')

        if (user_to.toLowerCase() === 'xikbot') {
            Chat.say(message.channel.name, `Wow someone actually loves me... I love you too ${message.user.displayName}! AngelThump`)
            return
        }

        if (user_to.toLowerCase() === user_from || ['myself', 'my self', 'himself', 'herself', 'him self', 'her self', 'itself'].indexOf(user_to.toLowerCase()) > -1) {
            Chat.say(message.channel.name, `Wow ${displayName} really loves themselves too much KappaPride`)
            return
        }

        if (user_from === 'chibsta' && user_to.toLowerCase() === 'freedman') {
            Chat.say(message.channel.name, 'There\'s 100% kanoH between Chibsta and ∠(ﾟДﾟ)／FREEEEEEDMAN !!')
            return
        }

        let date = new Date().toJSON().slice(0, 10),
            love = Math.floor(seedrandom(`${message.channel.name} ${user_from} ${user_to} ${date}`.toLowerCase())() * 100)

        Chat.say(message.channel.name, `There's ${love}% ${SETTINGS.emote.value} between ${message.user.displayName} and ${user_to}`)
    }
}
