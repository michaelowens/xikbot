import BaseModule from './base'
import Commands from '../models/command'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import {RateLimiter} from 'limiter'
import seedrandom from 'seedrandom'
import {ModuleSetting} from '../models/module'

export default class LoveModule extends BaseModule {
    constructor () {
        super()

        this.title = 'Love'
        this.description = 'Daily love calculations between 2 people'
        this.limiter = new RateLimiter(2, 30000)

        this.commands['love'] = Commands.rawCommand(this, this.love, {
            description: 'Calculate the love between 2 people'
        })

        this.settings = {
            'emote': new ModuleSetting({
                label: 'The emote to use',
                default: '<3',
                placeholder: '<3',
                constraint: {
                    minLength: 1
                }
            }),
            'responseLove': new ModuleSetting({
                label: 'What to respond when someone loves someone',
                default: 'There\'s {percentage}% {emote} between {user} and {other_user}',
                placeholder: 'There\'s {percentage}% {emote} between {user} and {other_user}'
            }),
            'responseLoveBot': new ModuleSetting({
                label: 'What to respond when someone loves Xikbot',
                default: 'Wow someone actually loves me... I love you too {user}! AngelThump',
                placeholder: 'Wow someone actually loves me... I love you too {user}! AngelThump'
            }),
            'responseLoveSelf': new ModuleSetting({
                label: 'What to respond when someone loves themselves',
                default: 'Wow {user} really loves themselves too much KappaPride',
                placeholder: 'Wow {user} really loves themselves too much KappaPride'
            })
        }
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

        Chat.say(message.channel.name, `There's ${love}% ${this.settings.emote.value} between ${message.user.displayName} and ${user_to}`)
    }
}
