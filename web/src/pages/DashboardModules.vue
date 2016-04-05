<template>
    <div>
        <section class="section">
            <div class="container">
                <h1 class="title">
                    Modules
                </h1>
                <h2 class="subtitle">
                    Enable and configure modules for your channel
                </h2>

                <hr>

                <div class="content is-centered" v-if="!loaded">
                    Loading...
                </div>

                <div v-if="loaded">
                    <h3 class="title is-3">Enabled modules</h3>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Description</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="enabledModules.length === 0">
                                <td colspan="5" class="is-text-centered">
                                    There are no enabled modules. Enable your first one down below!
                                </td>
                            </tr>
                            <tr v-for="module in enabledModules">
                                <td>{{ module.title }}</td>
                                <td>{{ module.description }}</td>
                                <td class="table-link table-icon">
                                    <a href="#">
                                        <i class="fa fa-toggle-on"></i>
                                    </a>
                                </td>
                                <td class="table-link table-icon">
                                    <a v-link="{ path: '/dashboard/modules/' + module.name }">
                                        <i class="fa fa-wrench"></i>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <hr>

                    <h3 class="title is-3">Disabled modules</h3>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Description</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="disabledModules.length === 0">
                                <td colspan="5" class="is-text-centered">
                                    There are no disabled modules!
                                </td>
                            </tr>
                            <tr v-for="module in disabledModules">
                                <td>{{ module.title }}</td>
                                <td>{{ module.description }}</td>
                                <td class="table-link table-icon">
                                    <a href="#">
                                        <i class="fa fa-toggle-off"></i>
                                    </a>
                                </td>
                                <td class="table-link table-icon">
                                    <a v-link="{ path: '/dashboard/modules/' + module.name }">
                                        <i class="fa fa-wrench"></i>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import moduleService from '../services/module.js'

export default {
    route: {
        data ({to, next}) {
            moduleService.all((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }

                next({
                    loaded: true,
                    modules: data
                })
            })
        }
    },
    data () {
        return {
            loaded: false,
            modules: []
        }
    },
    computed: {
        enabledModules: function () {
            return this.modules.filter(module => module.isEnabledForChannel)
        },
        disabledModules: function () {
            return this.modules.filter(module => !module.isEnabledForChannel)
        }
    },
    methods: {
        getModuleList () {
            moduleService.all((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                this.loaded = true
                this.modules = data
            })
        }
    }
}
</script>

<style>
</style>
