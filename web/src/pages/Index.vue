<template>
    <div>
        <section class="hero is-bold">
            <div class="hero-content">
                <div class="container">
                    <nav class="columns">
                        <div class="column is-centered">
                            <span class="icon is-large"><i class="fa fa-times-circle"></i></span>
                            <p class="title is-4">Spam protection</p>
                        </div>
                        <div class="column is-centered">
                            <span class="icon is-large"><i class="fa fa-wrench"></i></span>
                            <p class="title is-4">Custom commands</p>
                        </div>
                        <div class="column is-centered">
                            <span class="icon is-large"><i class="fa fa-repeat"></i></span>
                            <p class="title is-4">Timers</p>
                        </div>
                    </nav>
                </div>
            </div>
        </section>

        <section class="hero is-primary is-bold">
            <div class="hero-content">
                <div class="container">
                    <nav class="columns">
                        <div class="column is-centered">
                            <span class="icon is-large"><i class="fa fa-gamepad"></i></span>
                            <p class="title is-4">Fun commands</p>
                        </div>
                        <div class="column is-centered">
                            <span class="icon is-large"><i class="fa fa-wifi"></i></span>
                            <p class="title is-4">Free, like free wifi</p>
                        </div>
                    </nav>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import Hello from '../components/Hello'

export default {
    components: {
        Hello
    }
}
</script>
