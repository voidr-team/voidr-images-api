import HttpException from '#src/domain/exceptions/HttpException'

export default (rotateValue) => {
  const rotateValueNumber = Number(rotateValue)

  if (!rotateValue) {
    throw new HttpException(422, `invalid rotate value "${rotateValue}"`)
  }

  if (
    isNaN(rotateValueNumber) ||
    rotateValueNumber < 0 ||
    rotateValueNumber > 360
  ) {
    throw new HttpException(
      422,
      `rotate value should be a number between 0 and 360`
    )
  }

  return { angle: rotateValueNumber }
}
