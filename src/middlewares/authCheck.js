import { auth } from 'express-oauth2-jwt-bearer'

const authCheck = auth({
  audience: 'https://api.voidr.co/',
  issuerBaseURL: 'https://voidr-staging.us.auth0.com/',
  tokenSigningAlg: 'RS256',
})

export default authCheck
