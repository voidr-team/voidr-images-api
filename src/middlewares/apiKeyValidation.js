import config from '#src/config'

const apiKeyValidation = (req, res, next) => {
  const apiKey = req.headers['api_key']

  if (config.IS_LOCAL) {
    return next()
  }

  if (!apiKey || apiKey !== config.API_KEY) {
    return res.status(403).send('Access denied')
  }

  next()
}

export default apiKeyValidation
