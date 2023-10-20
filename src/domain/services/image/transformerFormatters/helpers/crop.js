import HttpException from '#src/domain/exceptions/HttpException'

export default (cropValue) => {
  if (!cropValue) {
    throw new HttpException(422, `invalid crop value ${cropValue}`)
  }

  const crops = cropValue.split('x')
  const [widthStr, heightStr] = crops
  const width = widthStr ? Number(widthStr) : undefined
  const height = heightStr ? Number(heightStr) : undefined

  if (crops.length !== 2 || (!width && !height) || (!heightStr && !widthStr)) {
    throw new HttpException(
      422,
      `invalid crop value ${cropValue}, crop value must be similar to 920x470 or 920x or x940`
    )
  }

  return {
    width,
    height,
  }
}
