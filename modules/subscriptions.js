import BaseModule from './base'
import Chat from '../models/chat'

export default class SubscriptionsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'subscriptions'
        this.description = 'Detect (re)subscriptions'
        this.events = {
            'subscription': this.onSubscription,
            'host': this.onHost
        }
    }

    onSubscription (data) {
        let resubmsg = (data.resub ? ` for ${data.months} months` : ``),
            msg = `[${data.user.displayName} has just subscribed${resubmsg}!]`

        Chat.action(data.channel.name, msg)
    }

    onHost (data) {
        let msg = `[${data.user.displayName} has just hosted us for ${data.viewers} viewers!]`;

        Chat.action(data.channel.name, msg)
    }
}
