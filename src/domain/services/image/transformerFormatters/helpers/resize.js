import HttpException from '#src/domain/exceptions/HttpException'

export default (resizeValue) => {
  if (!resizeValue) {
    throw new HttpException(422, `invalid crop value "${resizeValue}"`)
  }

  const resizes = resizeValue.split('x')
  const [widthStr, heightStr] = resizes
  const width = widthStr ? Number(widthStr) : undefined
  const height = heightStr ? Number(heightStr) : undefined

  if (
    resizes.length !== 2 ||
    (!width && !height) ||
    (!heightStr && !widthStr)
  ) {
    throw new HttpException(
      422,
      `invalid resize value "${resizeValue}", resize value must be similar to 920x470 or 920x or x940`
    )
  }

  return {
    width,
    height,
  }
}
