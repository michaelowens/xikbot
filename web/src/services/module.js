import Vue from 'vue'
export default {
    get (cb) {
        Vue.http.get('/api/modules').then((response) => {
            // if ('error' in response.data && response.data.error) {
            //     return cb(true, response.data)
            // }

            cb(null, response.data)
        }, () => {
            cb(true)
        })
    }
}
