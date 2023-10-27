import logger from '#src/domain/logger'
import axios from 'axios'

/**
 *
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
const downloadImageBuffer = async (url) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer',
      maxContentLength: 2000000,
      maxBodyLength: 2000000,
    })
    .catch((err) => {
      logger.error('Failed to download image', { url })
      throw err
    })
    .then((response) => response.data)
}

export default downloadImageBuffer
