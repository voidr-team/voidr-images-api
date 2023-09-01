import HttpException from '#src/domain/exceptions/HttpException'

const errorHandling = (err, req, res, next) => {
  if (err.isAxiosError) {
    if (err.response) {
      console.error(err.response.data)
      console.error(err.response.status)
    } else if (err.request) {
      console.error(err.request)
    } else if (err.message) {
      console.error('err', err.message)
    } else {
      console.error(err)
    }
    return res.status(500).json({ error: 'Integration server error' })
  }

  if (err instanceof HttpException) {
    return res
      .status(err.status)
      .json({ error: err.error, details: err.details })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
export default errorHandling
