import domain from 'domain'
import Chat from './models/chat'
import Database from './models/database'
import Log from './models/log'
import ModuleManager from './models/module'
import EventManager from './models/event'
import Netmessage from './models/netmessage'
import Web from './web'
import Metrics from './models/metrics'

let isBot = false,
    isWeb = false,
    dom = domain.create()

EventManager.on('error', (err) => Log.error(err.stack))
process.on('uncaughtException', (err) => Log.error(err.stack))

switch (process.argv[2]) {
    case 'bot':
        isBot = true
        break
    case 'web':
        isWeb = true
        break
    case 'both':
        isBot = true
        isWeb = true
        break
    default:
        console.error('Please add param with bot/web/both')
        process.exit(0)
        break
}

dom.on('error', err => Log.error(err.stack))

dom.run(() => {
    Metrics.start()
    Database.connect()
    ModuleManager.load()

    if (isBot) {
        Chat.connect()
        Netmessage.connectServer()
    }

    if (isWeb) {
        Web.start()
        Netmessage.connectClient()
    }
})

