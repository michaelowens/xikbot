import path from 'path'
import express from 'express'
import engine from 'ejs-locals'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import {Strategy as TwitchtvStrategy} from 'passport-twitchtv/lib/passport-twitchtv/index'
import Settings from './models/settings'
import Database from './models/database'
import Log from './models/log'

// Can't do this via import in 1 go :-(
let RedisStore = require('connect-redis')(session),
    root = path.join(__dirname, 'web', 'dist')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

passport.use(new TwitchtvStrategy({
    clientID: Settings.web.twitch.client_id,
    clientSecret: Settings.web.twitch.client_secret,
    callbackURL: Settings.web.twitch.callback_url,
    scope: 'user_read'
},
(accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        profile.access = true
        profile.config = {}

        Database.client.hget('users', profile.username, (err, value) => {
            if (!err && value) {
                try {
                    profile.config = JSON.parse(value)
                } catch (e) {}
            } else {
                profile.config = {
                    join: false
                }

                Database.client.hset('users', profile.username, JSON.stringify(profile.config), (err, value) => {
                    if (err) {
                        console.error('Error saving credentials for', profile.username)
                    }
                });
            }

            done(null, profile) 
        });
    })
}))

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    // res.redirect('/')
    res.json({
        error: true,
        logout: !req.user || !('username' in req.user)
    })
}

class Web {
    constructor () {
        this.app = null
    }

    start () {
        Log.info('Web server booting up')
        this.app = express()

        this.setup()
        this.startListening()
    }

    setup () {
        this.app.engine('ejs', engine)
        this.app.set('view engine', 'ejs')
        this.app.set('views', path.join(__dirname, 'web', 'views'))
        this.app.use(cookieParser())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(session({
            store: new RedisStore({
                client: Database.client
            }),
            secret: Settings.web.session.secret
        }))
        this.app.use(passport.initialize())
        this.app.use(passport.session())

        this.app.use(express.static(root))

        this.routes()
    }

    routes () {
        this.app.get('/auth',
            passport.authenticate('twitchtv', { scope: ['user_read'] }),
            function (req, res){
                // The request will be redirected to Twitch.tv for authentication, so this
                // function will not be called.
            }
        )

        this.app.get('/auth/callback',
            passport.authenticate('twitchtv', { failureRedirect: '/' }),
            function (req, res) {
                res.redirect('/dashboard')
            }
        )

        this.app.get('/auth/logout', function (req, res) {
            req.logout()
            res.redirect('/')
        })

        this.app.get('/api/commands', ensureAuthenticated, function (req, res) {
            Database.client.hgetall('commands_' + req.user.username, function (err, value) {
                if (err) {
                    return res.json({
                        error: true,
                        message: 'Could not get commands',
                        data: []
                    })
                }

                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        try {
                            value[prop] = JSON.parse(value[prop])
                        } catch (e) {
                            value[prop] = {}
                        }
                    } 
                }

                res.json({
                    error: false,
                    data: value || []
                })
            })
        })

        this.app.post('/api/commands/save', ensureAuthenticated, function (req, res) {
            if (!req.body.command || !req.body.data || !req.body.data.value) {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'Please fill in all required fields'
                })
            }

            var data = {
                value: req.body.data.value,
                mod: req.body.data.mod === true,
                me: req.body.data.me === true
            }

            var commandsKey = 'commands_' + req.user.username

            var saveCommand = () => {
                Database.client.hdel(commandsKey, req.body.originalCommand, function (err, value) {
                    Database.client.hset(commandsKey, req.body.command, JSON.stringify(data), function (err, value) {
                        if (err) {
                            res.status(500)
                            return res.json({
                                error: true,
                                message: 'There was a problem saving your command'
                            })
                        }

                        res.json({
                            error: false
                        })
                    })
                })
            }

            if ('adding' in req.body && req.body.adding) {
                Database.client.hget(commandsKey, req.body.command, function (err, value) {
                    if (value) {
                        res.status(500)
                        return res.json({
                            error: true,
                            message: 'Command already exists'
                        })
                    }

                    saveCommand()
                })
            } else {
                saveCommand();
            }
        })

        this.app.post('/api/commands/delete', ensureAuthenticated, function (req, res) {
            if (!('command' in req.body) || req.body.command === '') {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'A command is required'
                })
            }

            Database.client.hdel('commands_' + req.user.username, req.body.command, function (err, value) {
                if (err) {
                    res.status(500)
                    return res.json({
                        error: true,
                        message: 'There was a problem deleting your timer'
                    })
                }

                res.json({
                    error: false
                })
            })
        })

        this.app.get('/api/timers', ensureAuthenticated, function (req, res) {
            Database.client.lrange('timers_' + req.user.username, 0, -1, function (err, value) {
                if (err) {
                    return res.json({
                        error: true,
                        message: 'Could not get timers',
                        data: []
                    })
                }

                res.json({
                    error: false,
                    data: value || []
                })
            })
        })

        this.app.get('/api/timers/config', ensureAuthenticated, function (req, res) {
            Database.client.get('timerconfig_' + req.user.username, function (err, value) {
                if (err) {
                    return res.json({
                        error: true,
                        message: 'Could not get timer config',
                        data: []
                    })
                }

                res.json({
                    error: false,
                    data: JSON.parse(value) || []
                })
            })
        })

        this.app.post('/api/timers/config', ensureAuthenticated, function (req, res) {
            if (req.body.time < 1 || req.body.minMessages < 0) {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'Time and minMessages are required'
                })
            }

            const key = 'timerconfig_' + req.user.username
            Database.client.get(key, function (err, value) {
                var configValue = {}

                if (!err && value) {
                    configValue = JSON.parse(value)
                } else {
                    configValue = {
                        time: 30,
                        minMessages: 10,
                        lastRun: 0,
                        messageCount: 0,
                        lastTimerID: -1
                    }
                }

                configValue.time = parseInt(req.body.time, 10)
                configValue.minMessages = parseInt(req.body.minMessages, 10)

                Database.client.set(key, JSON.stringify(configValue), function (err, value) {
                    if (err) {
                        return res.json({
                            error: true,
                            message: 'Could not save timer config',
                            data: []
                        })
                    }

                    res.json({
                        error: false
                    })
                })
            })
        })

        this.app.post('/api/timers/new', ensureAuthenticated, function (req, res) {
            if (!req.body.message || req.body.message.length === 0) {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'A message is required'
                })
            }

            Database.client.rpush('timers_' + req.user.username, req.body.message, function (err, value) {
                if (err) {
                    res.status(500)
                    return res.json({
                        error: true,
                        message: 'There was a problem saving your timer'
                    })
                }

                res.json({
                    error: false
                })
            })
        })

        this.app.post('/api/timers/delete', ensureAuthenticated, function (req, res) {
            if (!('index' in req.body) || req.body.index < 0) {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'A message index is required'
                })
            }

            Database.client.lset('timers_' + req.user.username, req.body.index, '<!DELETED!>', function (err, value) {
                if (err) {
                    res.status(500)
                    return res.json({
                        error: true,
                        message: 'There was a problem deleting your timer'
                    })
                }

                Database.client.lrem('timers_' + req.user.username, 1, '<!DELETED!>', function (err, value) {
                    if (err) {
                        res.status(500)
                        return res.json({
                            error: true,
                            message: 'There was a problem deleting your timer'
                        })
                    }

                    res.json({
                        error: false
                    })
                })
            })
        })

        this.app.post('/api/timers/save', ensureAuthenticated, function (req, res) {
            if (!('index' in req.body) || req.body.index < 0 || !req.body.message || req.body.message.length === 0) {
                res.status(500)
                return res.json({
                    error: true,
                    message: 'Both id and message are required'
                })
            }

            Database.client.lset('timers_' + req.user.username, req.body.index, req.body.message, function (err, value) {
                if (err) {
                    res.status(500)
                    return res.json({
                        error: true,
                        message: 'There was a problem deleting your timer'
                    })
                }

                res.json({
                    error: false
                })
            })
        })

        this.app.post('/api/join', ensureAuthenticated, handleJoinApi('join'))
        this.app.post('/api/leave', ensureAuthenticated, handleJoinApi('leave'))

        function handleJoinApi(method) {
            return function (req, res) {
                Database.client.hget('users', req.user.username, function (err, value) {
                    var config = {join: false}
                    
                    if (value) {
                        config = JSON.parse(value)
                    }

                    config.join = method === 'join'

                    Database.client.hset('users', req.user.username, JSON.stringify(config), function (err, value) {
                        if (err) {
                            res.status(500)
                            return res.json({
                                error: true,
                                message: 'There was a problem saving your setting'
                            })
                        }

                        netClient.write(method + ':' + req.user.username, 'utf8')

                        req.user.config = config
                        req.session.save(function () {
                            res.json({
                                error: false,
                                join: config.join
                            })
                        })

                    })
                })
            }
        }

        this.app.get('/api/ping', ensureAuthenticated, function (req, res) {
            return res.json({
                error: false
            })
        })

        this.app.get('*', (req, res) => {
            res.render('index', {user: req.user, env: process.env})
        })
    }

    startListening () {
        this.app.listen(8081, function (err) {
            if (err) {
                console.log(err)
                return
            }
            Log.info('Listening at http://localhost:8081')
        })
    }
}

export default new Web