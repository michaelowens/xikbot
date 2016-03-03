import fs from 'fs'
import extend from 'extend'

let options = {},
    defaults = {
        bot: {
            admins: ['xikeon'],
            debug: false,
            name: 'Xikbot',
            oauth: 'oauth:',
            autojoin: [],
            connections: 1
        },
        plugins: {}
    }

let data = fs.readFileSync('settings.json')
options = extend(true, {}, defaults, JSON.parse(data))

export default options