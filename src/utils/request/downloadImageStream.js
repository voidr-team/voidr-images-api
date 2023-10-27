import axios from 'axios'

/**
 * @param {string} url
 */
const downloadImageStream = async (url) => {
  return axios.get(url, {
    responseType: 'stream',
  })
}

export default downloadImageStream
