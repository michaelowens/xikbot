import {assert} from 'chai'
import mockery from 'mockery'
//import User from '../../models/user.js'

mockery.enable({
  warnOnUnregistered: false
})
mockery.registerMock('./settings', {
  bot: {
    admins: ['xikeon']
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
  describe('.constructor', () => {
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

  describe('.isBroadcaster', () => {
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

  describe('.isSubscriber', () => {
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

  describe('.isMod', () => {
    it('returns true for a moderator or broadcaster', () => {
      let u = new User(data.mod, data.user.username)
      assert.isTrue(u.isMod(), 'as object')

      u = new User(data.user, data.user.username)
      assert.isTrue(u.isMod(), 'as object (broadcaster)')

      u = new User(data.username, data.user.username)
      assert.isTrue(u.isMod(), 'as string (broadcaster)')
    })

    it('returns false for non-mods', () => {
      let u = new User(data.sub, data.user.username)
      assert.isFalse(u.isMod(), 'as object')
    })
  })

  describe('.isAdmin', () => {
    it('returns true for admins configured in the settings', () => {
      let u = new User(data.user)
      assert.isTrue(u.isAdmin(), 'as object, without channel')

      u = new User(data.user, data.user.username)
      assert.isTrue(u.isAdmin(), 'as object, with channel')

      u = new User(data.username)
      assert.isTrue(u.isAdmin(), 'as string, without channel')

      u = new User(data.username, data.user.username)
      assert.isTrue(u.isAdmin(), 'as string, with channel')
    })

    it('returns true regardless of upper case characters', () => {
      let u = new User(data.username.toUpperCase())
      assert.isTrue(u.isAdmin(), 'as string, without channel, uppercase name')

      u = new User(data.username, data.user.username.toUpperCase())
      assert.isTrue(u.isAdmin(), 'as string, without channel, uppercase channel')
    })

    it('returns false for users not configured in the settings', () => {
      let u = new User(data.sub)
      assert.isFalse(u.isAdmin(), 'as object, without channel')

      u = new User(data.sub, data.user.username)
      assert.isFalse(u.isAdmin(), 'as object, with channel')

      u = new User(data.sub.username)
      assert.isFalse(u.isAdmin(), 'as string, without channel')

      u = new User(data.sub.username, data.user.username)
      assert.isFalse(u.isAdmin(), 'as string, with channel')
    })
  })

  describe('.isGlobalStaff', () => {
    it('returns true for global staff', () => {
      let u = new User(data.staff)
      assert.isTrue(u.isGlobalStaff(), 'as object, without channel')

      u = new User(data.staff, data.user.username)
      assert.isTrue(u.isGlobalStaff(), 'as object, with channel')
    })

    it('returns false for non-global staff', () => {
      let u = new User(data.user)
      assert.isFalse(u.isGlobalStaff(), 'user, as object, without channel')

      u = new User(data.sub)
      assert.isFalse(u.isGlobalStaff(), 'sub, as object, without channel')

      u = new User(data.user, data.user.username)
      assert.isFalse(u.isGlobalStaff(), 'user, as object, with channel')

      u = new User(data.sub, data.user.username)
      assert.isFalse(u.isGlobalStaff(), 'sub, as object, with channel')

      u = new User(data.user.username)
      assert.isFalse(u.isGlobalStaff(), 'user, as string, without channel')

      u = new User(data.sub.username, data.user.username)
      assert.isFalse(u.isGlobalStaff(), 'sub, as string, with channel')
    })
  })
})
