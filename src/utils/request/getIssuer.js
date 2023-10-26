import HttpException from '#src/domain/exceptions/HttpException'

/**
 * @param {Express.Request} req
 * @returns {Issuer}
 */
const getIssuer = (req) => {
  const issuer = req.issuer
  if (!issuer) {
    throw new HttpException(401, 'Invalid authentication')
  }
  return issuer
}

export default getIssuer
