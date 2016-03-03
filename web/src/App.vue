<template>
    <div id="app">
        <index-header></index-header>

        <router-view class="view" transition="test" transition-mode="out-in" keep-alive></router-view>
    </div>
</template>

<script>
import IndexHeader from './components/IndexHeader'

export default {
    components: {
        IndexHeader
    },
    data: function () {
        return {
            authenticated: 'username' in window['user'],
            user: window['user'],
            pingInterval: null
        }
    },
    methods: {
        setAuthenticationTimer: function () {
            clearTimeout(this.pingInterval)
            this.pingInterval = setTimeout(() => {
                this.$http.get('/api/ping').then(function (response) {
                    if (response.data.error === true) {
                        this.user = {}
                        this.authenticated = false
                        this.$route.router.go('/')
                        return
                    }
                    this.setAuthenticationTimer()
                }, function () {
                    this.user = {}
                    this.authenticated = false
                    this.$route.router.go('/')
                })
            }, 30000)
        }
    },
    ready: function () {
        this.setAuthenticationTimer()
    }
}
</script>

<style>
.view {
    transition: all .5s ease;
}
.test-enter, .test-leave {
    opacity: 0;
    transform: translate3d(10px, 0, 0);
}
[v-cloak] {
    display: none;
}
</style>
