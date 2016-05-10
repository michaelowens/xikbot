import mockery from 'mockery'
import fakeredis from 'fakeredis'
mockery.enable({
  warnOnUnregistered: false
})

mockery.registerMock('./settings', {
  bot: {
    admins: ['xikeon']
  },
  redis: {fast: true}
})

mockery.registerSubstitute('redis', 'fakeredis')

let Database = require('../models/database.js').default
Database.connect()

