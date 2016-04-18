import BaseModule from './base'
import Chat from '../models/chat'
import {ModuleSetting} from '../models/module'

export default class SubscriptionsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'Subscriptions'
        this.description = 'Detect (re)subscriptions, hosts and follows'
        this.events = {
            'subscription': this.onSubscription,
            'host': this.onHost
        }

        this.settings = {
            'subMessage': new ModuleSetting({
                label: 'What to say when someone subscribes for the first month',
                default: '[Thank you for subscribing, {user}!!]',
                placeholder: '[Thank you for subscribing, {user}!!]'
            }),
            'resubMessage': new ModuleSetting({
                label: 'What to say when someone resubscribes (2 or more months)',
                default: '[Thank you, {user}, for subscribing {months} months in a row!!]',
                placeholder: '[Thank you, {user}, for subscribing {months} months in a row!!]'
            })
        }
    }

    async onSubscription (data) {
        let settings = await this.getModuleSettingsValues(data.channel.name),
            msg = this.phrase(settings.subMessage, {
                user: data.user.displayName
            }) //`[Thank you for subscribing, ${data.user.displayName}! kanoHype Welcome to the PogChamp squad!]`

        if (data.resub) {
            msg = this.phrase(settings.resubMessage, {
                user: data.user.displayName,
                months: data.months
            }) //`[Thank you, ${data.user.displayName}, for subscribing ${data.months} months in a row! kanoHype ]`
        }

        Chat.action(data.channel.name, msg)
    }

    onHost (data) {
        let msg = `[${data.user.displayName} has just hosted us for ${data.viewers} viewers!]`

        Chat.action(data.channel.name, msg)
    }
}
