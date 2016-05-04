import Log from './log'
import Settings from './settings'

export default class User {
    constructor (user, channel) {
        if (typeof user === 'string') {
            user = {
                'display-name': user,
                'username': user.toLowerCase()
            }
        }
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
        return Settings.bot.admins.includes(this.name)
    }

    isGlobalStaff () {
        return ['global_mod', 'admin', 'staff'].includes(this.info['user-type'])
    }
}
