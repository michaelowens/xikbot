import ModuleManager from '../../models/module'
import Log from '../../models/log'

export default {
    async root (req, res) {
        let moduleSettings = await ModuleManager.getConfig(req.user.username).catch(err => Log.error(err)),
            modules = ModuleManager.get()
                .filter(module => module.global === false)
                .map(module => {
                    for (let command in module.commands) {
                        delete module.commands[command].scope
                    }

                    return {
                        name: module.constructor.name,
                        title: module.title,
                        description: module.description,
                        global: module.global,
                        commands: module.commands,
                        settings: moduleSettings[module.constructor.name],
                        events: module.events,
                        enabled: module.enabled,
                        isEnabledForChannel: module.isEnabledForChannel(req.user.username)
                    }
                })

        res.json(modules)
    },

    async module (req, res) {
        let module = ModuleManager.get(req.params.module),
            moduleSettings = await module.getModuleSettings(req.user.username).catch(err => Log.error(err))

        if (!module) {
            res.status(404)
            return res.json({
                error: true,
                message: 'Module not found',
                data: {}
            })
        }

        for (let command in module.commands) {
            delete module.commands[command].scope
        }

        res.json({
            name: module.constructor.name,
            title: module.title,
            description: module.description,
            global: module.global,
            commands: module.commands,
            settings: moduleSettings,
            events: module.events,
            enabled: module.enabled,
            isEnabledForChannel: module.isEnabledForChannel(req.user.username)
        })
    },

    save (req, res) {
        if (!('name' in req.body) || !('settings' in req.body)) {
            res.status(500)
            return res.json({
                error: true,
                message: 'Incorrect post data'
            })
        }

        let module = ModuleManager.get(req.body.name)

        for (let setting in module.settings) {
            if (!(setting in req.body.settings) || !('settings' in req.body.settings[setting])) {
                break
            }

            if ('value' in req.body.settings[setting].settings) {
                module.settings[setting].value = req.body.settings[setting].settings.value
            }
        }

        module.saveChannelSettings(req.user.username)

        res.json({
            error: false
        })
    }
}
