import path from 'node:path'

const getImageNameFromUrl = (urlStr) => {
  const url = new URL(urlStr)
  return path.parse(url.pathname).name
}

export default getImageNameFromUrl
