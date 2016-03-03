import domain from 'domain'
import Chat from './models/chat'
import Database from './models/database'
import Log from './models/log'
import ModuleManager from './models/module'
import EventManager from './models/event'
import Netmessage from './models/netmessage'
import Web from './web'

let isBot = true,
    both = false,
    dom = domain.create()

EventManager.on('error', (err) => Log.error(err.stack))
process.on('uncaughtException', (err) => Log.error(err.stack))

switch (process.argv[2]) {
    case 'web':
        isBot = false
    case 'both':
        both = true
}

dom.on('error', err => Log.error(err.stack))

dom.run(() => {
    Database.connect()
    ModuleManager.load()

    if (isBot || both) {
        Chat.connect()
        Netmessage.connectServer()
    }

    if (!isBot || both) {
        Web.start()
        Netmessage.connectClient()
    }
})

