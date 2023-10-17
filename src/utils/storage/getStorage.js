import { Storage } from '@google-cloud/storage'
import crypto from '../../_utils/crypto'
import storageServiceAccount from './storage-service-account'

const getStorage = () => {
  const storage = new Storage({
    credentials: crypto.decryptJson(storageServiceAccount),
  })

  return storage
}

export default getStorage
