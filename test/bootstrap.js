import mockery from 'mockery'

mockery.enable({
  warnOnUnregistered: false
})

mockery.registerMock('./settings', {
  bot: {
    admins: ['xikeon']
  }
})

mockery.registerSubstitute('redis', 'fakeredis')

