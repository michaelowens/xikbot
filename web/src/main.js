import Vue from 'vue'
import App from './App'
import IndexPage from './pages/Index'
import AboutPage from './pages/About'
import DashboardPage from './pages/Dashboard'
import DashboardIndexPage from './pages/DashboardIndex'
import DashboardCommandsPage from './pages/DashboardCommands'
import DashboardTimersPage from './pages/DashboardTimers'
import DashboardModulesPage from './pages/DashboardModules'
import DashboardModuleSettingsPage from './pages/DashboardModuleSettings'
import NotFoundPage from './pages/NotFound'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

Vue.use(VueRouter)
Vue.use(VueResource)

const router = new VueRouter({
    linkActiveClass: 'is-active',
    history: true
})

router.map({
    '/': {
        component: IndexPage
    },
    '/about': {
        component: AboutPage
    },
    '/dashboard': {
        component: DashboardPage,
        name: 'dashboard',
        auth: true,
        subRoutes: {
            'timers': {
                component: DashboardTimersPage
            },
            'commands': {
                component: DashboardCommandsPage
            },
            'modules/:module': {
                component: DashboardModuleSettingsPage
            },
            'modules': {
                component: DashboardModulesPage
            },
            '/': {
                component: DashboardIndexPage
            }
        }
    },
    '*': {
        component: NotFoundPage
    }
})

router.beforeEach(function (transition) {
    var authenticated = 'access' in window.user // && window.user.access === true
    if (transition.to.auth) {
        if (!authenticated) {
            transition.redirect('/')
        }
    }
    if (transition.to.guest) {
        if (authenticated) {
            transition.redirect('/')
        }
    }
    transition.next()
})

const app = Vue.extend(App)
router.start(app, '#app')
