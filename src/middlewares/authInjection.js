import config from '#src/config'
import { prop } from 'ramda'

const authInjection = (req, res, next) => {
  if (!req.auth?.payload) return next()
  const organization = prop(`${config.AUDIENCE}organization`, req.auth.payload)

  const roles = prop(`${config.AUDIENCE}roles`, req.auth.payload)

  const user = prop(`${config.AUDIENCE}user`, req.auth.payload)

  req.auth.payload = {
    ...req.auth.payload,
    organization,
    roles,
    user,
  }

  next()
}

export default authInjection
