import HttpException from '#src/domain/exceptions/HttpException'

export default (convertValue) => {
  const availableFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif']
  if (!availableFormats.includes(convertValue)) {
    throw new HttpException(
      422,
      `convert format "${convertValue}" not available`
    )
  }

  return { format: convertValue }
}
