exports.up = client => new Promise((resolve, reject) => {
  client.eval(`for _,k in ipairs(redis.call('keys', 'test')) do 
      redis.call('rename', 'test', 'test' .. ':data')
    end`, 0, err => {
      if (err) {
        console.err(err)
        return reject()
      }
      resolve()
    })
})

exports.down = client => new Promise((resolve, reject) => {
  client.eval(`for _,k in ipairs(redis.call('keys', 'test:data')) do 
      redis.call('rename', 'test:data', 'test')
    end`, 0, err => {
      if (err) {
        console.err(err)
        return reject()
      }
      resolve()
    })
})
