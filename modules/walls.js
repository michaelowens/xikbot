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
            'message': this.onMessage
        }

        this.modCount = 0
        this.subCount = 0

        this.settings = {
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
            })
        }
    }

    onMessage (data) {
        let reset = false,
            wall = null

        if (this.modCount >= this.settings.modWallCount.value || this.subCount >= this.settings.subWallCount.value) {
            wall = (this.modCount >= this.settings.modWallCount.value ? 'mod' : 'sub')

            if (wall === 'mod' && !data.user.isMod()) {
                reset = true
                this.modCount = 0
            }

            if (wall === 'sub' && !data.user.isSubscriber()) {
                reset = true
                this.subCount = 0
            }

            if (reset) {
                Chat.action(data.channel.name, `Thank you, ${data.user.displayName} our savior, for stopping the ${wall} wall! kanoHype`)
                return
            }
            wall = null
        }

        if (!data.user.isSubscriber() && !data.user.isMod()) {
            this.modCount = 0
            this.subCount = 0
            return
        }

        if (data.user.isMod()) {
            this.modCount++

            if (!data.user.isSubscriber()) {
                this.subCount = 0
            }
        }

        if (data.user.isSubscriber()) {
            this.subCount++

            if (!data.user.isMod()) {
                this.modCount = 0
            }
        }

        if (this.modCount === this.settings.modWallCount.value) {
            wall = 'mod'
        } else if (this.subCount === this.settings.subWallCount.value) {
            wall = 'sub'
        }

        if (wall) {
            Chat.action(data.channel.name, `Can a non-${wall} please end this ${wall} wall?! SwiftRage`)
        }
    }
}
