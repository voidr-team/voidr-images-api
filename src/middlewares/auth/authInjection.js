import config from '#src/config'
import { prop } from 'ramda'

const authInjection = (req, res, next) => {
  if (!req.auth?.payload) return next()
  const organization = prop(
    `${config.AUTH.AUDIENCE}organization`,
    req.auth.payload
  )

  const roles = prop(`${config.AUTH.AUDIENCE}roles`, req.auth.payload)

  const user = prop(`${config.AUTH.AUDIENCE}user`, req.auth.payload)

  const issuer = {
    organizationId: organization.id || req.auth.payload.sub,
    sub: req.auth.payload.sub,
  }

  req.issuer = issuer

  req.auth.payload = {
    ...req.auth.payload,
    organization,
    roles,
    user,
  }

  next()
}

export default authInjection
