<template>
    <div>
        <section class="section">
            <div class="container">
                <h1 class="title">
                    Commands
                </h1>
                <h2 class="subtitle">
                    Custom commands for your channel
                </h2>

                <hr>

                <div class="content is-centered" v-if="!loaded">
                    Loading...
                </div>

                <div class="columns" v-if="loaded">
                    <div class="column is-3">
                        <nav class="menu">
                            <p class="menu-heading">
                                Commands
                            </p>
                            <a class="menu-block" href="#" v-for="command in commands" @click="editCommand($key)" :class="{'is-active': selectedCommand == $key}">
                                <span class="menu-icon">
                                    <i class="fa fa-chevron-right"></i>
                                </span>
                                {{ $key }}
                            </a>
                            <div class="menu-block">
                                <button class="button is-primary is-outlined is-fullwidth" @click="addCommand">
                                    Add command
                                </button>
                            </div>
                        </nav>
                    </div>
                    <div class="column is-9" v-show="success">
                        <div class="notification is-success">
                            The changes have been saved!
                        </div>
                    </div>
                    <div class="column is-9" v-show="selectedCommand || adding" transition="fade">
                        <div class="notification is-danger" v-if="error">
                            {{ error }}
                        </div>

                        <div class="columns no-margin-bottom">
                            <div class="column is-9">
                                <p class="control is-grouped">
                                    <span class="button is-disabled">!</span>
                                    <input class="input" type="text" placeholder="Command" v-model="tmpCommandKey" required>
                                </p>
                            </div>

                            <div class="column is-3">
                                <p class="control is-grouped">
                                    <span class="select is-fullwidth">
                                        <select v-model="tmpCommand.command" class="is-fullwidth">
                                            <option value="plaintext">Plain text</option>
                                            <template v-for="option in modules" v-if="shouldShowModule(option)">
                                                <option v-for="command in getModule(option.name).commands" :value="option.name + '.' + command.name" >
                                                    {{ option.name | cleanModuleName }}.{{ command.name }}
                                                </option>
                                            </template>
                                        </select>
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p class="control" v-if="tmpCommand.command == 'plaintext'">
                            <textarea class="textarea" placeholder="Textarea" v-model="tmpCommand.value"></textarea>
                        </p>
                        <p class="control" v-else>
                            <strong>Description:</strong> {{ getCommand(tmpCommand.command).options.description | json }}
                        </p>

                        <p class="control">
                            <label class="checkbox">
                                <input type="checkbox" v-model="tmpCommand.me">
                                Run as /me
                            </label>
                        </p>
                        <p class="control">
                            <label class="checkbox">
                                <input type="checkbox" v-model="tmpCommand.mod">
                                Mod only
                            </label>
                        </p>

                        <div class="control is-clearfix">
                            <div class="is-pulled-left">
                                <button class="button is-primary" @click="saveCommand" :class="{'is-loading': saving}">
                                    {{ adding ? 'Create' : 'Save' }}
                                </button>
                                <button class="button" @click="cancelEdit()">Cancel</button>
                            </div>

                            <div class="is-pulled-right" v-if="!adding" @click="deleteCommand">
                                <button class="button is-danger">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import commandService from '../services/command.js'
import moduleService from '../services/module.js'

export default {
    route: {
        data ({to, next}) {
            let loaded = 0

            commandService.all((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }

                this.commands = data
                if (++loaded === 2) {
                    next({
                        loaded: true
                    })
                }
            })

            moduleService.all((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }

                this.modules = data
                if (++loaded === 2) {
                    next({
                        loaded: true
                    })
                }
            })
        }
    },
    data () {
        return {
            loaded: false,
            saving: false,
            adding: false,
            success: false,
            error: null,
            commands: [],
            selectedCommand: null,
            tmpCommandKey: '',
            tmpCommand: {},
            modules: []
        }
    },
    filters: {
        cleanModuleName (name) {
            return name.toLowerCase().replace(/module$/, '')
        }
    },
    methods: {
        addCommand () {
            this.error = null
            this.selectedCommand = null
            this.tmpCommand = {
                command: 'plaintext'
            }
            this.tmpCommandKey = ''
            this.adding = true
            this.success = false
        },
        editCommand (key) {
            this.error = null
            this.selectedCommand = key
            this.tmpCommand = this.commands[key]
            this.tmpCommandKey = key
            this.adding = false
            this.success = false
        },
        cancelEdit () {
            this.error = null
            this.selectedCommand = null
            this.tmpCommand = {}
            this.tmpCommandKey = ''
            this.adding = false
            this.success = false
        },
        saveCommand () {
            let data = {
                adding: this.adding,
                command: this.tmpCommandKey,
                originalCommand: this.selectedCommand,
                data: this.tmpCommand
            }

            this.success = false
            this.error = null
            this.saving = true
            this.$http.post('/api/commands/save', data).then(function (response) {
                this.saving = false
                this.adding = false
                this.success = true
                this.selectedCommand = null
                this.tmpCommandKey = ''
                this.tmpCommand = {}

                this.getCommandList()
            }, function (response) {
                this.saving = false
                this.error = response.data.message
            })
        },
        deleteCommand () {
            let data = {
                command: this.selectedCommand
            }

            this.$http.post('/api/commands/delete', data).then(function (response) {
                this.saving = false
                this.adding = false
                this.selectedCommand = null
                this.tmpCommandKey = ''
                this.tmpCommand = {}

                if ('error' in response && response.error) {
                    this.error = response.data.message
                    return
                }

                this.getCommandList()
            }, function () {
                this.saving = false
                // this.error = response.data.message
            })
        },
        getCommandList () {
            commandService.all((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                this.loaded = true
                this.commands = data
            })
        },
        getModule (name) {
            var s = name.split('.')
            return this.modules.find(module => module.name === s[0])
        },
        getCommand (name) {
            var s = name.split('.')
            return this.modules.find(module => module.name === s[0]).commands[s[1]]
        },
        shouldShowModule (module) {
            return module.enabled == true && module.isEnabledForChannel == true && !$.isEmptyObject(module.commands)
        }
    }
}
</script>

<style>
.menu-block {
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu-block.is-active {
    background: #f5f7fa;
}

.no-margin-bottom {
    margin-bottom: 0;
}
</style>
