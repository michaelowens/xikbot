exports.up = client => new Promise((resolve, reject) => {
  client.eval(`for _,k in ipairs(redis.call('keys', 'commands_*')) do
      redis.call('rename', k, 'users:' .. k:sub(10) .. ':commands')
    end`, 0, err => {
    if (err) {
      console.err(err)
      return reject()
    }
    resolve()
  })
})

exports.down = client => new Promise((resolve, reject) => {
  client.eval(`for _,k in ipairs(redis.call('keys', 'users:*:commands')) do 
      redis.call('rename', k, 'commands_' .. k:sub(7, -10))
    end`, 0, err => {
    if (err) {
      console.err(err)
      return reject()
    }
    resolve()
  })
})
