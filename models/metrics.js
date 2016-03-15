import metrics from 'datadog-metrics'
import Settings from './settings'
import Chat from './chat'
import Log from './log'

class Metrics {
    constructor() {
        this.channels = 0
    }

    start() {
        if (!('datadog' in Settings)) {
            return
        }

        Log.info('Initializing metrics')
        metrics.init({
            apiKey: Settings.datadog.api_key,
            host: Settings.datadog.host || 'xikbot-local',
            prefix: Settings.datadog.prefix || 'xikbot-local.'
        })

        this.setupMetrics()
    }

    setupMetrics() {
        setInterval(_ => {
            metrics.gauge('channels.joined', Chat.client.channels.length)
        }, 1000 * 60 * 10)

        setInterval(_ => {
            metrics.gauge('irc.latency', Chat.client.currentLatency)
        }, 1000 * 30)
    }
}

export default new Metrics