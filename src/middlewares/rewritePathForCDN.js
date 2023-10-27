import config from '#src/config'

function rewritePathForCDN(req, res, next) {
  if (req.headers.host === 'img.voidr.co') {
    req.url = `/v1/images${req.url}`
  }
  if (req.headers.host === '127.0.0.1:3000' && config.IS_LOCAL) {
    req.url = `/v1/images${req.url}`
  }
  next()
}

export default rewritePathForCDN
