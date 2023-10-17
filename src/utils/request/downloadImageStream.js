import logger from '#src/domain/logger'
import axios from 'axios'

/**
 *
 * @param {string} url
 * @returns {import('node:stream').Readable}
 */
const downloadImageStream = async (url) => {
  return axios
    .get(url, {
      responseType: 'stream',
    })
    .catch((err) => {
      logger.error('Failed to download image', { url })
      throw err
    })
    .then((response) => response.data)
}

export default downloadImageStream
