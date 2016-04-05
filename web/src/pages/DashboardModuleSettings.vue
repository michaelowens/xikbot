<template>
    <div>
        <section class="section">
            <div class="container">
                <h1 class="title">
                    Module: {{ module.title }}
                </h1>
                <h2 class="subtitle">
                    Configure the module to your likings
                </h2>

                <hr>

                <div class="content is-centered" v-if="!loaded">
                    Loading...
                </div>

                <div v-if="loaded">
                    <h3 class="title is-3">Settings</h3>

                    <form method="post" @submit="onSubmit">
                        <component :is="getComponentName(setting.settings.type)" :data="setting.settings" v-for="setting in module.settings"></component>

                        <p class="control">
                            <button type="submit" class="button is-primary">Save</button>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import moduleService from '../services/module'
import formString from '../components/form/String'
import formNumber from '../components/form/Number'
import formCheckbox from '../components/form/Checkbox'

export default {
    route: {
        data ({to, next, abort}) {
            moduleService.get(this.$route.params.module, (err, data) => {
                if (err) {
                    return to('/dashboard/modules')
                    // we're not really handling this right now (^:
                }

                console.log('got data', data)

                next({
                    loaded: true,
                    module: data
                })
            })
        }
    },
    components: {
        'form-string': formString,
        'form-number': formNumber,
        'form-checkbox': formCheckbox
    },
    filters: {
        prefix (name, str) {
            return str + name
        }
    },
    data () {
        return {
            loaded: false,
            module: {}
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
            moduleService.get((err, data) => {
                if (err) {
                    // we're not really handling this right now (^:
                }
                this.loaded = true
                this.modules = data
            })
        },
        getComponentName (name) {
            return `form-${name.toLowerCase()}`
        },
        onSubmit (e) {
            e.preventDefault()
            moduleService.save(this.module)
                .then(response => {
                    console.log('saved!')
                })
        }
    }
}
</script>

<style>
</style>
