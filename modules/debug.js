import BaseModule from './base'
import Log from '../models/log'
import Commands from '../models/command'
import Chat from '../models/chat'
import _eval from 'eval'

export default class DebugModule extends BaseModule {
    constructor () {
        super()
       
        this.global = true
        this.title = 'Debug'
        this.description = 'Helpers for debugging'
        
        this.commands['eval'] = Commands.rawCommand(this, this.eval, {
            description: 'Evaluate code'
        })
    }

    eval (data) {
        if (!data.whisper) return
        if (!data.user.isAdmin()) return
        Log.debug(`Evaluating: ${data.params.join(' ')}`)
        _eval.call(this, data.params.join(' '), 'eval', {
            Chat: Chat
        }, true)
    }
}
