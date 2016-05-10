import {assert} from 'chai'
import sinon from 'mocha-sinon'
import Database from '../../models/database.js'

// The sole purpose of this test is to make sure the "connection" is working
describe('Database (using fakeredis)', () => {
  it('should be able to SET / GET data', () => {
    Database.client.SET('one', 'two', test('SET', null, 'OK'))
    Database.client.GET('one', test('GET', null, 'two'))
  })
})

function test(name, xErr, xData, done) {
  return (err, data) => {
    if (err) {
      err = err.message
    }

    if (err) {
      assert.equal(xErr, err)
    } else {
      assert.equal(xData, data)
    }
  }
}
