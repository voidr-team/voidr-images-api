import HttpException from '#src/domain/exceptions/HttpException'

export default (compressValue) => {
  const compressValueNumber = Number(compressValue)

  if (!compressValue) {
    throw new HttpException(422, `invalid compress value ${compressValue}`)
  }

  const slugAvailableValues = ['smart']

  if (
    isNaN(compressValueNumber) &&
    !slugAvailableValues.includes(compressValue)
  ) {
    throw new HttpException(
      422,
      `compress value should be a number between 0 to 100 or "smart"`
    )
  }

  if (isNaN(compressValueNumber)) return { quality: compressValue }

  return { quality: compressValueNumber }
}
