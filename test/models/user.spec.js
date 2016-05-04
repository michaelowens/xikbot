import {assert} from 'chai'
import mockery from 'mockery'
//import User from '../../models/user.js'

mockery.enable({
  warnOnUnregistered: false
})
mockery.registerMock('./settings', {
  bot: {
    admins: ['Xikeon']
  }
})

let User = require('../../models/user.js').default

let data = {
  username: 'Xikeon',
  user: {
    'display-name': 'Xikeon',
    'username': 'xikeon',
    'subscriber': false,
    'user-type': ''
  },
  mod: {
    'display-name': 'Kappa',
    'username': 'kappa',
    'subscriber': false,
    'user-type': 'mod'
  },
  sub: {
    'display-name': 'Kappa',
    'username': 'kappa',
    'subscriber': true,
    'user-type': ''
  },
  staff: {
    'display-name': 'Kappa',
    'username': 'kappa',
    'subscriber': false,
    'user-type': 'admin'
  }
}

describe('User', () => {
  describe('#constructor', () => {
    it('can be initialised with a string', () => {
      let u = new User(data.username)
      assert.equal(u.info['display-name'], data.username)
      assert.equal(u.info.username, data.username.toLowerCase())
      assert.equal(u.displayName, data.username)
      assert.equal(u.name, data.username.toLowerCase())
    })

    it('can be initialised with an object (twitch spec)', () => {
      let u = new User(data.user)
      assert.equal(u.info['display-name'], data.user['display-name'])
      assert.equal(u.info.username, data.user.username)
      assert.equal(u.displayName, data.user['display-name'])
      assert.equal(u.name, data.user.username)
    })

    it('can be initialised with an object (twitch spec), without display-name', () => {
      let userobj = Object.assign({}, data.user),
        u
      delete userobj['display-name']
      u = new User(userobj)
      assert.equal(u.displayName, userobj.username)
    })
  })

  describe('#isBroadcaster', () => {
    it('returns true for broadcaster', () => {
      let u = new User(data.user, data.user.username)
      assert.isTrue(u.isBroadcaster(), 'as object')

      u = new User(data.username, data.username.toLowerCase())
      assert.isTrue(u.isBroadcaster(), 'as string')
    })

    it('returns false for non-broadcaster', () => {
      let u = new User(data.mod, data.user.username)
      assert.isFalse(u.isBroadcaster(), 'as object')

      u = new User(data.mod['display-name'], data.user.username)
      assert.isFalse(u.isBroadcaster(), 'as string')
    })
  })

  describe('#isSubscriber', () => {
    it('returns true for a subscriber', () => {
      let u = new User(data.sub, data.user.username)
      assert.isTrue(u.isSubscriber(), 'as object')
    })

    it('returns false for a non-subscriber', () => {
      let u = new User(data.mod, data.user.username)
      assert.isFalse(u.isSubscriber(), 'as object')

      u = new User(data.mod['display-name'], data.user.username)
      assert.isFalse(u.isSubscriber(), 'as string')
    })
  })
})
