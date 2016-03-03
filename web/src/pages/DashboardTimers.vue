<template>
    <div>
        <section class="section">
            <div class="container">
                <h1 class="title">
                    Timers
                </h1>
                <h2 class="subtitle">
                    Automated and timed messages
                </h2>

                <hr>

                <div class="content is-centered" v-if="!loaded">
                    Loading...
                </div>

                <div class="columns" v-if="loaded">
                    <div class="column is-8">
                        <h4 class="title is-4">Messages</h4>

                        <table class="table is-bordered is-striped">
                            <tbody>
                                <tr v-for="message in timers">
                                    <td v-if="tmpTimer.index != $index">{{ message }}</td>
                                    <td v-if="tmpTimer.index == $index">
                                        <div class="control is-grouped">
                                            <input type="text" class="input" v-model="tmpTimer.message" @keyup.enter="saveTimer">

                                            <button class="button is-primary" :class="{'is-disabled': tmpTimer.message.length == 0, 'is-loading': savingTimerEdit}" @click="saveTimer">
                                                Save
                                            </button>
                                        </div>
                                    </td>

                                    <td class="table-link table-icon" v-if="tmpTimer.index != $index">
                                        <a href="#" @click="editTimer($index)">
                                            <i class="fa fa-pencil"></i>
                                        </a>
                                    </td>
                                    <td class="table-link table-icon" v-if="tmpTimer.index != $index">
                                        <a href="#" @click="deleteTimer($index)">
                                            <i class="fa fa-trash"></i>
                                        </a>
                                    </td>

                                    <td colspan="2" v-if="tmpTimer.index == $index">
                                        <button class="button is-danger" :class="{'is-loading': savingTimerEdit}" @click="closeEdit">
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="timers.length == 0">
                                    <td>
                                        No messages added. Add your first below!
                                    </td>
                                    <td class="table-link table-icon">
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <input type="text" class="input" placeholder="New message" v-model="newMessage" @keyup.enter="addTimer" :class="{'is-disabled': savingTimer}">
                                    </td>
                                    <td colspan="2">
                                        <button class="button is-primary" :class="{'is-disabled': newMessage.length == 0, 'is-loading': savingTimer}" @click="addTimer">
                                            Add
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="column is-4">
                        <h4 class="title is-4">Settings</h4>

                        <p class="control is-grouped">
                            <span class="button is-disabled">Run every</span>
                            <input class="input" type="text" placeholder="N" v-model="config.time" required>
                            <span class="button is-disabled">minutes</span>
                        </p>

                        <p class="control is-grouped">
                            <span class="button is-disabled">After</span>
                            <input class="input" type="text" placeholder="N" v-model="config.minMessages" required>
                            <span class="button is-disabled">messages</span>
                        </p>

                        <div class="control is-clearfix">
                            <div class="is-pulled-right">
                                <button class="button is-primary" @click="saveConfig" :class="{'is-loading': savingConfig}">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import timerService from '../services/timer.js'
export default {
    route: {
        data ({to, next}) {
            let loaded = 0

            timerService.get((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                if (++loaded === 2) {
                    this.timers = data
                    next({
                        loaded: true
                    })
                }
            })

            timerService.getConfig((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                this.config = $.extend({}, this.config, data)
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
            savingConfig: false,
            savingTimer: false,
            savingTimerEdit: false,
            error: null,
            timers: [],
            newMessage: '',
            tmpTimer: {
                index: null,
                message: null
            },
            config: {
                time: 30,
                minMessages: 10
            }
        }
    },
    methods: {
        saveConfig: function () {
            this.config.time = parseInt(this.config.time, 10)
            this.config.minMessages = parseInt(this.config.minMessages, 10)
            if (!this.config.time || this.config.time < 1 || this.config.minMessages < 0) {
                return
            }

            this.error = null
            this.savingConfig = true
            this.$http.post('/api/timers/config', this.config).then(function (response) {
                this.savingConfig = false
            }, function (response) {
                this.savingConfig = false
                this.error = response.data.message
            })
        },
        editTimer: function (index) {
            this.tmpTimer = {
                index: index,
                message: this.timers[index]
            }
        },
        closeEdit: function () {
            this.tmpTimer = {
                index: null,
                message: null
            }
        },
        deleteTimer: function (key) {
            this.$http.post('/api/timers/delete', {index: key}).then(function (response) {
                this.timers.splice(key, 1)
            }, function (response) {
                this.saving = false
                this.error = response.data.message
            })
        },
        saveTimer: function () {
            if (this.tmpTimer.index === null || this.tmpTimer.message === null || this.tmpTimer.length === 0) {
                return
            }

            this.error = null
            this.savingTimerEdit = true
            this.$http.post('/api/timers/save', this.tmpTimer).then(function (response) {
                this.timers.$set(this.tmpTimer.index, this.tmpTimer.message)

                this.savingTimerEdit = false
                this.tmpTimer = {
                    index: null,
                    message: null
                }
            }, function (response) {
                this.savingTimerEdit = false
                this.error = response.data.message
            })
        },
        addTimer: function () {
            if (this.newMessage.length === 0) {
                return
            }

            this.error = null
            this.savingTimer = true
            this.$http.post('/api/timers/new', {message: this.newMessage}).then(function (response) {
                this.timers.push(this.newMessage)

                this.savingTimer = false
                this.newMessage = ''
            }, function (response) {
                this.saving = false
                this.error = response.data.message
            })
        },
        getData: function () {
            let loaded = 0

            timerService.get((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                if (++loaded === 2) {
                    this.loaded = true
                }
                this.timers = data
            })

            timerService.getConfig((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                this.config = $.extend({}, this.config, data)
                if (++loaded === 2) {
                    this.loaded = true
                }
            })
        }
    },
    ready: function () {
        this.getData()
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
</style>
