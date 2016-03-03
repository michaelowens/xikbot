<template>
    <div>
        <section class="section no-padding-bottom dashboard-warning" v-if="$route.path === '/dashboard'" transition="test" transition-mode="out-in">
            <div class="container">
                <div class="notification is-danger" v-if="!$root.user.config.join">
                    <div class="content">
                        <button class="is-pulled-right button is-success is-small" @click="api('join')">
                            Join my channel!
                        </button>
                        <p class="is-pulled-left">
                            Xikbot is currently not in your channel!
                        </p>
                    </div>
                </div>
                <div class="notification is-success" v-else>
                    <div class="content">
                        <button class="is-pulled-right button is-danger is-small" @click="api('leave')">
                            Leave my channel!
                        </button>
                        <p class="is-pulled-left">
                            Xikbot is in your channel!
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <router-view class="dashboard-view" transition="test" transition-mode="out-in" keep-alive v-if="$root.user.access"></router-view>

        <section class="section" v-if="!$root.user.access">
            <div class="container">
                <h1 class="title">
                    No access
                </h1>

                <div class="content">
                    <p>
                        Currently only invited members have access to the dashboard.
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    methods: {
        api: function (method) {
            this.$http.post('/api/' + method)
                .then(function (response) {
                    if (!response.data.error) {
                        this.$root.user.config.join = response.data.join
                    }
                }, function () {})
        }
    }
}
</script>

<style>
.dashboard-view, .dashboard-warning {
    transition: all .5s ease;
}
.test-enter, .test-leave {
    opacity: 0;
    transform: translate3d(10px, 0, 0);
}
[v-cloak] {
    display: none;
}

.no-padding-bottom {
    padding-bottom: 0;
}

.is-pulled-left {
    float: left;
}

.is-pulled-right {
    float: right;
}
</style>
