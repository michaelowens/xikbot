import Database from '../../models/database'

export default {
    root (req, res) {
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
    },

    getConfig (req, res) {
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
    },

    postConfig (req, res) {
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
    },

    new (req, res) {
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
    },

    delete (req, res) {
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
    },

    save (req, res) {
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
    }
}