import config from '#src/config'
import CryptoJS from 'crypto-js'

// Encrypt
const encrypt = (raw) => {
  const ciphertext = CryptoJS.AES.encrypt(raw, config.ENCRYPT_SECRET).toString()
  return ciphertext
}

const encryptJson = (obj) => encrypt(JSON.stringify(obj))

// Decrypt
const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, config.ENCRYPT_SECRET)
  const originalText = bytes.toString(CryptoJS.enc.Utf8)
  return originalText
}

const decryptJson = (ciphertext) => JSON.parse(decrypt(ciphertext))

export default { encrypt, encryptJson, decrypt, decryptJson }
