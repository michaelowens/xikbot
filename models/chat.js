// import EventManager from './event'
import tmi from 'tmi.js'
import Settings from './settings'
import EventManager from './event'
import ModuleManager from './module'
import Database from './database'
import Log from './log'
import {RateLimiter} from 'limiter'
import User from './user'

class Chat {
    constructor () {
        this.client = null
        this.whisperClient = null
        this.whisperRetries = 0
        this.connected = false
        this.joinLimiter = new RateLimiter(49, 15000)
        this.chatLimiter = new RateLimiter(80, 30000)
    }

    connect () {
        setTimeout(() => {
            if (!this.connected) {
                Log.error('[Chat]', 'Failed to connect to Twitch chat. Restarting...')
            }
        }, 10000)

        this.spawnClient()
        this.spawnWhisperClient()
    }

    spawnClient (cluster = 'aws') {
        let client = new tmi.client({
            options: {
                debug: Settings.bot.debug
            },
            connection: {
                cluster: cluster,
                reconnect: true
            },
            identity: {
                username: Settings.bot.name,
                password: Settings.bot.oauth
            },
            logger: Log
        })

        client.connect()

        client.on('connected', (address, port) => {
            Log.info('[Chat]', `Connected to Twitch chat (${address.yellow}:${port})`)

            this.client = client

            this.connected = true
            this.autojoin()
                .catch((err) => {
                    Log.error(err.stack)
                })
        })

        client.on('chat', (channel, user, message, self) => {
            if (user.name !== Settings.bot.name.toLowerCase()) {
                this.handleMessage(channel, user, message, self)
            }
        })

        client.on('action', (channel, user, message, self) => {
            if (user.name !== Settings.bot.name.toLowerCase()) {
                this.handleAction(channel, user, message, self)
            }
        })

        client.on('subscription', (channel, username) => {
            if (channel) {
                channel = channel.replace(/^#/i, '')
            }
            EventManager.emit('subscription', {
                resub: false,
                channel: {
                    name: channel
                },
                user: new User(username, channel),
                months: 1
            })
        })

        client.on('subanniversary', (channel, username, months) => {
            if (channel) {
                channel = channel.replace(/^#/i, '')
            }
            EventManager.emit('subscription', {
                resub: true,
                channel: {
                    name: channel
                },
                user: new User(username, channel),
                months: months
            })
        })

        client.on('notice', (channel, msgid, message) => {
            Log.info('[notice]', channel, msgid, message)

            if (msgid === 'color_changed') {
                this.client.color('green')
            }
        })

        // TODO: fix cause this won't work, only if you're on oauth of channel owner
        client.on('hosted', (channel, username, viewers) => {
            Log.info(`[hosted] ${channel} got hosted by ${username} for ${viewers} viewers`)
            EventManager.emit('host', {
                channel: {
                    name: channel
                },
                user: new User(username, channel),
                viewers: viewers
            })
        })
    }

    spawnWhisperClient () {
        if (this.whisperClient) {
            return
        }

        let whisperSettings = {
            options: {
                debug: Settings.bot.debug
            },
            identity: {
                username: Settings.bot.name,
                password: Settings.bot.oauth
            },
            logger: Log
        }

        if (this.whisperRetries <= 8) {
            this.whisperRetries++

            if (this.whisperRetries <= 5) {
                whisperSettings.connection = {
                    cluster: 'group'
                }
            }
        } else {
            this.whisperRetries = 0
        }

        if (!whisperSettings.connection) {
            whisperSettings.connection = {
                server: '199.9.253.119',
                port: '80'
            }
        }

        let client = new tmi.client(whisperSettings)

        client.connect()

        client.on('connected', (address, port) => {
            this.whisperRetries = 0
            Log.info('[Chat]', '[Whisper]', `Connected to Twitch Group chat (${address.yellow}:${port})`)
            this.whisperClient = client
        })

        client.on('whisper', (user, message, self) => {
            if (user.name !== Settings.bot.name.toLowerCase()) {
                this.handleMessage(null, user, message, self, true)
            }
        })

        client.on('disconnected', (reason) => {
            Log.error('[Chat]', '[Whisper]', 'Retrying, reason:', reason)
            client.disconnect()
            this.whisperClient = null
            this.spawnWhisperClient()
        })
    }

    // TODO: Rate limit ASAP! max 50 per 15s
    join (channel) {
        if (typeof channel === 'object') {
            return channel.forEach(channel => this.join(channel))
        }

        if (channel.indexOf('#') === -1) {
            channel = `#${channel}`
        }
        
        this.joinLimiter.removeTokens(1, () => {
            this.client.join(channel)
            ModuleManager.loadConfig(channel.substr(1))
                .catch(e => Log.error(e.stack))
            EventManager.emit('channel:join', channel)
        })
    }

    part (channel) {
        if (typeof channel === 'object') {
            return channel.forEach(channel => this.part(channel))
        }

        if (channel.indexOf('#') === -1) {
            channel = `#${channel}`
        }
        
        this.client.part(channel)
        EventManager.emit('channel:part', channel)
    }

    async autojoin () {
        if (Settings.bot.autojoin.length) {
            // Log.write('Joining channels from config')
            this.join(Settings.bot.autojoin)
        }

        let users = await Database.client.hgetallAsync('users')

        for (let user in users) {
            let config = users[user]
            try {
                users[user] = JSON.parse(config)
            }
            catch (e) {
                Log.error(`Error parsing user data for ${user}`)
                Log.error(e.stack)
            }
        }

        for (let user in users) {
            if (users[user].join) {
                this.join(user)
            }
        }
    }

    handleMessage (channel, user, message, self, whisper = false) {
        if (self) {
            return
        }

        let params = message.split(' '),
            command = null,
            data = {}

        if (params[0] && params[0].startsWith('!')) {
            command = params.shift().substr(1)
        }

        if (channel) {
            channel = channel.replace(/^#/i, '')
        }

        data = {
            command: command,
            message: message,
            params: params,
            whisper: whisper,
            user: new User(user, channel),
            channel: {
                name: channel
            }
        }

        EventManager.emit('message', data)

        if (command) {
            EventManager.emit(`command:${command}`, data)
        }
    }

    handleAction (channel, user, message, self, whisper = false) {
        EventManager.emit('action', {
            message: message,
            params: message.split(' '),
            whisper: whisper,
            user: new User(user, channel),
            channel: {
                name: channel
            }
        })
    }

    say (channel, message, action = false) {
        if (!this.chatLimiter.tryRemoveTokens(1)) {
            return Xikbot.error('Could not send response, rate limited')
        }

        if (channel.indexOf('#') === -1) { 
            channel = `#${channel}`
        }

        if (!action) {
            message = message.replace(/^[.|/]+/i, '') 
        }

        this.client[action ? 'action' : 'say'](channel, message)
    }

    action (channel, message) {
        this.say(channel, message, true)
    }

    whisper (user, message) {
        if (!this.whisperClient) {
            return
        }

        this.whisperClient.whisper(user, message)
    }
}

export default new Chat