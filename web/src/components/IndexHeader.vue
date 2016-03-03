<template>
    <section class="hero is-info is-left is-bold">
        <div class="hero-header">
            <header class="header">
                <div class="container">
                    <div class="header-left">
                        <a v-link="{ path: '/' }" class="header-item title"><strong>Xikbot</strong></a>
                    </div>

                    <span id="header-toggle" class="header-toggle" :class="{'is-active': menuOpen}" @click="menuOpen = !menuOpen">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>

                    <div id="header-menu" class="header-right header-menu" :class="{'is-active': menuOpen}">
                        <span class="header-item"><a v-link="{ path: '/', exact: true }">Home</a></span>
                        <span class="header-item"><a v-link="{ path: '/about' }">About</a></span>
                        <span class="header-item" v-if="$root.authenticated"><a href="/auth/logout">Logout</a></span>
                        <span class="header-item">
                            <a href="/auth" class="button is-inverted is-outlined is-info" v-if="!$root.authenticated">
                                <i class="fa fa-twitch"></i>
                                Sign in with Twitch
                            </a>
                            <a v-link="{ path: '/dashboard', activeClass: 'active' }" class="button is-inverted is-outlined is-info" v-if="$root.authenticated">
                                <i class="fa fa-cogs"></i>
                                Dashboard
                            </a>
                        </span>
                    </div>
                </div>
            </header>
        </div>
        <div class="hero-content" v-show="$route.name != 'dashboard'" transition="expand">
            <div class="container">
                <h1 class="title">
                    <strong>Xikbot</strong> is just another Twitch chatbot
                </h1>
                <h2 class="subtitle">
                    that empowers a handful of channels with <em>amazing</em> features
                </h2>
            </div>
        </div>
        <div class="hero-footer" v-show="$route.name == 'dashboard' && $root.user.access" transition="expand">
            <nav class="tabs is-boxed is-fullwidth">
                <div class="container">
                    <ul>
                        <li v-link-active="is-active"><a v-link="{ path: '/dashboard', exact: true }">Overview</a></li>
                        <li v-link-active="is-active"><a v-link="{ path: '/dashboard/commands' }">Commands</a></li>
                        <li v-link-active="is-active"><a v-link="{ path: '/dashboard/timers' }">Timers</a></li>
                        <li class="is-disabled"><a href="#">Blacklist</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    </section>
</template>

<script>
export default {
    data: function () {
        return {
            menuOpen: false
        }
    }
}
</script>

<style>
/* always present */
.expand-transition {
    transition: all .3s ease;
    overflow: hidden;
}

/* .expand-enter defines the starting state for entering */
/* .expand-leave defines the ending state for leaving */
.expand-enter, .expand-leave {
    height: 0;
    padding: 0 10px;
    opacity: 0;
}
</style>
