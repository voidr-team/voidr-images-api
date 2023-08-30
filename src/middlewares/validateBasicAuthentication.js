import accountRepository from '#src/infra/repositories/accountRepository'
import { omit } from 'ramda'

async function validateBasicAuthentication(clientId, clientSecret, done) {
  try {
    const account =
      await accountRepository.getByClientIdWithClientSecretAndPopulate(clientId)

    if (!account || account.clientSecret !== clientSecret) {
      return done(null, false)
    }
    return done(null, omit(['clientSecret'], account))
  } catch (err) {
    return done(err)
  }
}

export default validateBasicAuthentication
