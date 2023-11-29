import config from '#src/config'
import { auth } from 'express-oauth2-jwt-bearer'

const authCheck = auth({
  audience: config.AUTH.AUDIENCE,
  issuerBaseURL: config.AUTH.ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
})

export default authCheck
