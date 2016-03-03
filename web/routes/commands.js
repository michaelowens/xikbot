import Database from '../../models/database'

export default {
    root (req, res) {
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
    },

    save (req, res) {
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
    },

    delete (req, res) {
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
    }
}
