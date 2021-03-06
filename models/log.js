import colors from 'colors'

export default class Log {
    static getTime() {
        let date = new Date(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            seconds = date.getSeconds(),
            ampm = hour >= 12 ? 'pm' : 'am'

        hour = hour % 12
        hour = hour ? hour : 12
        hour = hour < 10 ? '0' + hour : hour
        minute = minute < 10 ? '0' + minute : minute
        seconds = seconds < 10 ? '0' + seconds : seconds

        return `${hour}:${minute}:${seconds}${ampm}`
    }

    static write(...params) {
        console.log(
            `[${this.getTime()}]`,
            ...params
        )
    }

    static error(...params) {
        console.error(
            `[${this.getTime()}]`,
            'error:'.red,
            ...params
        )
    }

    static info(...params) {
        console.info(
            `[${this.getTime()}]`,
            'info:'.blue,
            ...params
        )
    }

    static debug(...params) {
        console.log(
            `[${this.getTime()}]`,
            'debug:'.yellow,
            ...params
        )
    }

    static warn(...params) {
        console.log(
            `[${this.getTime()}]`,
            'warn:'.yellow,
            ...params
        )
    }
}
