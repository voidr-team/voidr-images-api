import HttpException from '#src/domain/exceptions/HttpException'
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
      maxContentLength: 5000000,
      maxBodyLength: 5000000,
      headers: {
        VoidrImages: 'download-image',
      },
    })
    .catch((err) => {
      logger.error('Failed to download image', { url, message: err?.message })
      throw err
    })
    .then((response) => {
      const contentType =
        response.headers['content-type'] || response.headers['Content-Type']
      if (contentType.startsWith('image/')) return response.data
      else throw new HttpException(400, 'File is not an image')
    })
}

export default downloadImageBuffer
