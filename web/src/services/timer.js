import Vue from 'vue'
export default {
    get (cb) {
        Vue.http.get('/api/timers').then((response) => {
            if ('error' in response.data && response.data.error) {
                return cb(true, response.data.data)
            }

            cb(null, response.data.data)
        }, () => {
            cb(true)
        })
    },

    getConfig (cb) {
        Vue.http.get('/api/timers/config').then((response) => {
            if ('error' in response.data && response.data.error) {
                return cb(true, response.data.data)
            }

            cb(null, response.data.data)
        }, () => {
            cb(true)
        })
    }
}
