import net from 'net'
import Chat from './chat'
import Log from './log'

class Netmessage {
    constructor () {
        this.server = null
        this.client = null
    }

    connectServer () {
        this.server = net.createServer((socket) => {
            socket.setEncoding('utf8')
            socket.on('data', (data) => {
                if (data.indexOf('join:') === 0) {
                    Chat.join(data.substr(5))
                }
                else if (data.indexOf('leave:') === 0) {
                    Chat.leave(data.substr(6))
                }
            })
        })

        this.server.listen(9191, (err) => {
            if (err) {
                Log.error('Error setting up Netmessage server')
                return Log.error(err)
            }

            Log.info('Netmessage server running!')
        })
    }

    connectClient () {
        try {
            this.client = net.connect({port: 9191})
                .on('error', (e) => Log.error(e.stack))
                .on('close', () => {
                    setTimeout(() => {
                        this.connectClient()
                    }, 10000)
                })
        } catch (e) {
            console.error('Net crashed!') 
        }
    }
}

export default new Netmessage
