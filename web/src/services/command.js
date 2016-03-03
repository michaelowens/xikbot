import Vue from 'vue'
export default {
    get (cb) {
        Vue.http.get('/api/commands').then((response) => {
            if ('error' in response.data && response.data.error) {
                return cb(true, response.data.data)
            }

            cb(null, response.data.data)
        }, () => {
            cb(true)
        })
    }
}
