import Log from './log'
import Settings from './settings'

export default class User {
    constructor (user, channel) {
        this.info = user
        this.channel = channel
        this.displayName = user['display-name'] || user.username
        this.name = user.username
    }

    isBroadcaster () {
        return this.name === this.channel
    }

    isSubscriber () {
        return this.info.subscriber === true
    }

    isMod () {
        return this.info['user-type'] === 'mod' || this.isBroadcaster()
    }

    isAdmin () {
        return this.name in Settings.bot.admins
    }

    isGlobalStaff () {
        return ['global_mod', 'admin', 'staff'].indexOf(this.info['user-type'])
    }
}