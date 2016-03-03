export default {
    root (req, res) {
        // The request will be redirected to Twitch.tv for authentication,
        // so this function will not be called.
    },

    callback (req, res) {
        res.redirect('/dashboard')
    },

    logout (req, res) {
        req.logout()
        res.redirect('/')
    }
}
