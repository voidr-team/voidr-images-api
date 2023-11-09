import HttpException from '#src/domain/exceptions/HttpException'
import logger from '#src/domain/logger'

const errorHandling = (err, req, res, next) => {
  if (err.isAxiosError) {
    if (err.response) {
      logger.error({
        data: err.response.data,
        status: err.response.status,
        message: err.message,
      })
    } else if (err.request) {
      logger.error(err.request)
    } else if (err.message) {
      logger.error(err.message)
    } else {
      logger.error(err)
    }
    return res.status(err?.response?.status || 500).json({
      error: 'Integration error',
      details: err?.response?.data?.message,
    })
  }

  if (err instanceof HttpException) {
    logger.error(err)
    return res
      .status(err.status)
      .json({ error: err.error, details: err.details })
  }

  if (err.status === 401) {
    logger.warn(err)
    return res.status(err.status).json({ error: 'Unauthorized' })
  }

  logger.error(err)

  return res.status(err.status || 500).json({ error: 'Internal server error' })
}
export default errorHandling
