import Vue from 'vue'
export default {
    all (cb) {
        Vue.http.get('/api/modules').then(response => {
            // if ('error' in response.data && response.data.error) {
            //     return cb(true, response.data)
            // }

            cb(null, response.data)
        }, () => {
            cb(true)
        })
    },

    get (name, cb) {
        Vue.http.get(`/api/modules/${name}`).then(response => {
            if ('error' in response.data && response.data.error) {
                return cb(true, response.data)
            }

            cb(null, response.data)
        }, () => {
            cb(true)
        })
    },

    save (module) {
        return new Promise((resolve, reject) => {
            Vue.http.post('/api/modules/save', module).then(response => {
                resolve()
            }, () => {
                reject()
            })
        })
    }
}
