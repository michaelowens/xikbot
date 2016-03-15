import BaseModule from './base'
import Commands from '../models/command'
import Database from '../models/database'
import Log from '../models/log'
import Chat from '../models/chat'
import EventManager from '../models/event'
import Cache from '../models/cache'
import request from 'request-promise'

export default class BlacklistModule extends BaseModule {
    constructor () {
        super()

        this.title = 'Blacklist'
        this.description = 'Protection against common spam and adds chat moderation functionality'
        this.events = {
            'message': this.onMessage
        }

        this.updateBlacklist(true)
            .catch(e => Log.error(e.stack))

        Cache.on('expired', (key, value) => {
            if (key === 'blacklist.cache') {
                this.updateBlacklist()
                    .catch(e => Log.error(e.stack))
            }
        })
    }

    onMessage (data) {
        if (data.whisper || data.user.isMod() || data.user.isAdmin() || data.user.isGlobalStaff()) {
            return
        }

        let banned = false

        if (this.findBlacklisted(data.message)) {
            Chat.client.ban(data.channel.name, data.user.name)
            banned = true
        }

        if (!banned) {
            try {
                this.findBlacklistedURLs(data.message)
                    .catch(e => Log.error(e.stack))
            } catch (e) {
                Log.error(e.stack)
            }
        }
    }

    async updateBlacklist (first = false) {
        if (first) {
            Cache.set('blacklist.cache', [])
        }

        let value = await Database.client.lrangeAsync('blacklist', 0, -1)
        Cache.set('blacklist.cache', value, 24 * 60 * 3600)
    }

    findBlacklisted (message) {
        let blacklist = Cache.get('blacklist.cache')
        return blacklist.some(item => new RegExp(item, 'i').test(message))
    }

    async findBlacklistedURLs (message) {
        return false

        // This is disabled for now, redirectdetective seems to block our requests

        let urls = message.match(/(([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+(\/([a-z0-9+\$_-]\.?)+)*\/?)/gi)

        Log.debug('found urls:', urls)

        if (!urls) {
            return
        }

        for (let url of urls) {
            let options = {
                method: 'POST',
                url: 'http://redirectdetective.com/linkdetect.px',
                form: {
                    w: url
                },
                gzip: true,
                jar: true,
                headers: {
                    Host: 'redirectdetective.com',
                //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
                //     Origin: 'http://redirectdetective.com',
                //     Referer: 'http://redirectdetective.com/',
                //     'Connection': 'keep-alive',
                //     'Accept': '*/*',
                    'Referer': 'http://redirectdetective.com/'
                //     'Accept-Language': 'en-US,en;q=0.8,nl;q=0.6'
                }
                // transform: body => body
            }
            Log.debug('checking url:', url)
            let body = await request(options)
            Log.debug('got body')
            Log.debug(body)
        }
    }
}
