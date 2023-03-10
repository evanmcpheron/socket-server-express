const express = require('express')

const { routing } = require('../../constants')

const globalRoute = require('./global.routes')

module.exports = (application) => {
  const router = express.Router()

  router.use(routing.GLOBAL_ROOT, globalRoute(application))

  return router
}
