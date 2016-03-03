import ModuleManager from '../../models/module'
import Log from '../../models/log'

export default {
    root (req, res) {
        let modules = ModuleManager.get().map(module => {
            Log.debug(module)

            for (var command in module.commands) {
                delete module.commands[command].scope
            }

            return {
                name: module.constructor.name,
                title: module.title,
                global: module.global,
                commands: module.commands,
                settings: module.settings,
                events: module.events,
                enabled: module.enabled,
                isEnabledForChannel: module.isEnabledForChannel(req.user.username)
            }
        })

        res.json(modules)
    }
}
