import HttpException from '#src/domain/exceptions/HttpException'

export default (blurValue) => {
  if (!blurValue) {
    throw new HttpException(422, `invalid blur value "${blurValue}"`)
  }

  const blur = Number(blurValue)

  if (blur < 0.3 || blur > 1000 || isNaN(blur)) {
    throw new HttpException(
      422,
      `invalid blue value "${blurValue}", resize value must be number between 0.3 to 1000`
    )
  }

  return { sigma: blur }
}
