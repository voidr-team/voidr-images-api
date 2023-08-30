import { Account } from '#models/Account'
import crypto from 'crypto'

const getByClientIdWithClientSecretAndPopulate = async (clientId) => {
  return await Account.findOne({ clientId: clientId })
    .select('+clientSecret')
    .populate('customer')
    .exec()
}

const create = async ({ accountName, accountDescription, customerId }) => {
  const clientId = crypto.randomBytes(16).toString('hex')
  const clientSecret = crypto.randomBytes(32).toString('hex')
  const account = new Account({
    accountName,
    accountDescription,
    customerId,
    clientId,
    clientSecret,
  })
  await account.save()
  return account
}

export default {
  getByClientIdWithClientSecretAndPopulate,
  create,
}
