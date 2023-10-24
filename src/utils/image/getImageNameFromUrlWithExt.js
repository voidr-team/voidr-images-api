import path from 'node:path'

const getImageNameFromUrlWithExt = (urlStr) => {
  const url = new URL(urlStr)
  return path.basename(url.pathname)
}

export default getImageNameFromUrlWithExt
