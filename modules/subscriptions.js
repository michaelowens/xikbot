import BaseModule from './base'
import Chat from '../models/chat'

export default class SubscriptionsModule extends BaseModule {
    constructor () {
        super()

        this.title = 'subscriptions'
        this.description = 'Detect (re)subscriptions'
        this.events = {
            'subscription': this.onSubscription
        }
    }

    onSubscription (data) {
        if (!this.isEnabledForChannel(data.channel.name)) {
            return
        }

        let resubmsg = (data.resub ? ` for ${data.months} months` : ``),
            msg = `[${data.user.displayName} has just subscribed${resubmsg}!]`

        Chat.action(data.channel.name, msg)
    }
}
