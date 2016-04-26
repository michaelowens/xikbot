import BaseModule from './base'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import EventManager from '../models/event'
import {ModuleSetting} from '../models/module'

export default class WallsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'Walls'
        this.description = 'Detect mod/sub walls and adds possible replies for making/breaking them'
        this.events = {
            'message': this.onMessage,
            'action': this.onMessage
        }

        this.modCount = {}
        this.subCount = {}

        this.settings = {
            'onlyWhenLive': new ModuleSetting({
                label: '(COMING SOON) Only active when channel is live',
                default: false,
                disabled: true
            }),
            'modWallCount': new ModuleSetting({
                label: 'Amount of messages by moderators before considered a wall',
                default: 15,
                placeholder: 15,
                constraint: {
                    min: 1,
                    max: 99
                }
            }),
            'subWallCount': new ModuleSetting({
                label: 'Amount of messages by subscribers before considered a wall',
                default: 15,
                placeholder: 15,
                constraint: {
                    min: 1,
                    max: 99
                }
            }),
            'wallMessage': new ModuleSetting({
                label: 'Message to send when wall has been activated',
                default: 'Can a non-{type} please end this {type} wall?! SwiftRage',
                placeholder: 'Can a non-{type} please end this {type} wall?! SwiftRage'
            }),
            'wallBreakMessage': new ModuleSetting({
                label: 'Message to send when a user breaks a wall',
                default: 'Thank you, {user} our savior, for stopping the {type} wall! kanoHype',
                placeholder: 'Thank you, {user} our savior, for stopping the {type} wall! kanoHype'
            })
        }
    }

    async onMessage (data) {
        let reset = false,
            wall = null,
            settings = await this.getModuleSettingsValues(data.channel.name)

        if (!(data.channel.name in this.modCount)) {
            this.modCount[data.channel.name] = 0
        }

        if (!(data.channel.name in this.subCount)) {
            this.subCount[data.channel.name] = 0
        }

        if (this.modCount[data.channel.name] >= settings.modWallCount || this.subCount[data.channel.name] >= settings.subWallCount) {
            wall = (this.modCount[data.channel.name] >= settings.modWallCount ? 'mod' : 'sub')

            if (wall === 'mod' && !data.user.isMod()) {
                reset = true
                this.modCount[data.channel.name] = 0
            }

            if (wall === 'sub' && (!data.user.isSubscriber() || data.user.name === 'allie9926')) {
                reset = true
                this.subCount[data.channel.name] = 0
            }

            if (reset) {
                if (data.user.name === 'allie9926') {
                    Chat.action(data.channel.name, `${data.user.displayName} will always be a pleb in my heart. Thanks for stopping the ${wall} wall! kanoW`)
                    return
                }

                Chat.action(data.channel.name, this.phrase(settings.wallBreakMessage, {
                    user: data.user.displayName,
                    type: wall
                })) //`Thank you, ${data.user.displayName} our savior, for stopping the ${wall} wall! kanoHype`)
                return
            }
            wall = null
        }

        if (!data.user.isSubscriber() && !data.user.isMod()) {
            this.modCount[data.channel.name] = 0
            this.subCount[data.channel.name] = 0
            return
        }

        if (data.user.isMod()) {
            this.modCount[data.channel.name]++

            if (!data.user.isSubscriber()) {
                this.subCount[data.channel.name] = 0
            }
        }

        if (data.user.isSubscriber()) {
            this.subCount[data.channel.name]++

            if (!data.user.isMod()) {
                this.modCount[data.channel.name] = 0
            }
        }

        if (this.modCount[data.channel.name] === settings.modWallCount) {
            wall = 'mod'
        } else if (this.subCount[data.channel.name] === settings.subWallCount) {
            wall = 'sub'
        }

        if (wall) {
            Chat.action(data.channel.name, this.phrase(settings.wallMessage, {
                user: data.user.displayName,
                type: wall
            })) //`Can a non-${wall} please end this ${wall} wall?! SwiftRage`)
        }
    }
}
