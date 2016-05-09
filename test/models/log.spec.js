import {assert} from 'chai'
import sinon from 'mocha-sinon'
import Log from '../../models/log.js'
import colors from 'colors'

let tests = {
  'write': {},
  'error': {
    'prefix': 'error:'.red,
    'logger': 'error'
  },
  'info': {
    'prefix': 'info:'.blue,
    'logger': 'info'
  },
  'debug': {
    'prefix': 'debug:'.yellow
  },
  'warn': {
    'prefix': 'warn:'.yellow
  }
}

describe('Log', () => {
  beforeEach(function() {
    for (let logger of ['log', 'error', 'info']) {
      let log = console[logger]
      this.sinon.stub(console, logger, (...args) => {
        if (!args[0].match(/\[\d{2}:\d{2}:\d{2}[a-z]{2}\]/i)) {
          return log.apply(log, args)
        }
      })
    }
  })

  for (let test in tests) {
    let opts = tests[test]
    describe(`.${test}`, () => {
      it('should call console.log', () => {
        let time = Log.getTime(),
          args = []

        Log[test].call(Log, 'test')

        args = [`[${time}]`, 'test']
        if ('prefix' in opts) {
          args.splice(1, 0, opts.prefix)
        }
        assert.isTrue(console[opts.logger || 'log'].calledWithExactly(...args))
      })

      it('should handle multiple arguments', () => {
        let time = Log.getTime(),
          args = []

        Log[test].call(Log, 'test', 'two')
        args = [`[${time}]`, 'test', 'two']
        if ('prefix' in opts) {
          args.splice(1, 0, opts.prefix)
        }
        assert.isTrue(console[opts.logger || 'log'].calledWith(...args))

        Log[test].call(Log, 'test', 'two', 'three')
        args = [`[${time}]`, 'test', 'two']
        if ('prefix' in opts) {
          args.splice(1, 0, opts.prefix)
        }
        assert.isTrue(console[opts.logger || 'log'].calledWith(...args))

        assert.isTrue(console[opts.logger || 'log'].calledTwice)
      })
    })
  }
})
