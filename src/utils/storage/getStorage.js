import { Storage } from '@google-cloud/storage'
import storageServiceAccount from './storageServiceAccount'
import crypto from '#utils/crypto'

const getStorage = () => {
  const storage = new Storage({
    credentials: crypto.decryptJson(storageServiceAccount),
  })

  return storage
}

export default getStorage
