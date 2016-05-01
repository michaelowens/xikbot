import domain from 'domain'
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

import authRoutes from './web/routes/auth'
import commandsRoutes from './web/routes/commands'
import timersRoutes from './web/routes/timers'
import modulesRoutes from './web/routes/modules'

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
            secret: Settings.web.session.secret,
            resave: false,
            saveUninitialized: false
        }))
        this.app.use(passport.initialize())
        this.app.use(passport.session())

        this.app.use(express.static(root))

        this.routes()
    }

    routes () {
        this.route('get', 
            '/auth',
            passport.authenticate('twitchtv', { scope: ['user_read'] }),
            authRoutes.root
        )
        this.route('get', 
            '/auth/callback',
            passport.authenticate('twitchtv', { failureRedirect: '/' }),
            authRoutes.callback
        )
        this.route('get', '/auth/logout', authRoutes.logout)

        this.route('get', '/api/commands', ensureAuthenticated, commandsRoutes.root)
        this.route('post', '/api/commands/save', ensureAuthenticated, commandsRoutes.save)
        this.route('post', '/api/commands/delete', ensureAuthenticated, commandsRoutes.delete)

        this.route('get', '/api/timers', ensureAuthenticated, timersRoutes.root)
        this.route('get', '/api/timers/config', ensureAuthenticated, timersRoutes.getConfig)
        this.route('post', '/api/timers/config', ensureAuthenticated, timersRoutes.postConfig)
        this.route('post', '/api/timers/new', ensureAuthenticated, timersRoutes.new)
        this.route('post', '/api/timers/delete', ensureAuthenticated, timersRoutes.delete)
        this.route('post', '/api/timers/save', ensureAuthenticated, timersRoutes.save)

        this.route('post', '/api/join', ensureAuthenticated, handleJoinApi('join'))
        this.route('post', '/api/leave', ensureAuthenticated, handleJoinApi('leave'))

        this.route('get', '/api/modules', ensureAuthenticated, modulesRoutes.root)
        this.route('get', '/api/modules/:module', ensureAuthenticated, modulesRoutes.module)
        this.route('post', '/api/modules/save', ensureAuthenticated, modulesRoutes.save)

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

        this.route('get', '/api/ping', ensureAuthenticated, function (req, res) {
            return res.json({
                error: false
            })
        })

        this.route('get', '/api/*', function (req, res) {
            return res.json({})
        })

        this.route('get', '*', (req, res) => {
            res.render('index', {user: req.user, env: process.env})
        })
    }

    route (method, url, ...callbacks) {
        let callback = callbacks.pop()
        
        let errCatcher = callback => {
            return (req, res) => {
                let response
                try {
                    response = callback(req, res)
                } catch (e) {
                    Log.error(e.stack)
                }

                if (response instanceof Promise) {
                    response.catch(e => Log.error(e.stack))
                }
            } 
        }
        this.app[method](url, ...callbacks, errCatcher(callback))
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
