import HttpException from '#src/domain/exceptions/HttpException'

export default (radiusValue) => {
  if (!radiusValue) {
    throw new HttpException(422, `invalid radius value ${radiusValue}`)
  }
  const isPx = radiusValue.endsWith('px')
  const isPercent = radiusValue.endsWith('p')
  if (!isPx && !isPercent) {
    throw new HttpException(
      422,
      `invalid radius unit, radius unit must be "px" for pixels or "p" for percentage`
    )
  }

  const radiusValueNumber = Number(
    radiusValue.replace('px', '').replace('p', '')
  )

  if (
    isNaN(radiusValueNumber) ||
    radiusValueNumber < 0 ||
    radiusValueNumber > 360
  ) {
    throw new HttpException(
      422,
      `radius value must be a value between 0 and 360, radius value should be similar to "50p" or "12px"`
    )
  }

  if (isPercent && radiusValue > 100) {
    throw new HttpException(
      422,
      `radius value in percent must be between 0 and 100`
    )
  }

  return { length: radiusValue }
}
