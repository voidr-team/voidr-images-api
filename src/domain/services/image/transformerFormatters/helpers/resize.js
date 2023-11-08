import HttpException from '#src/domain/exceptions/HttpException'
import getOptionalArguments from './getOptionalArguments'

const optionalArgumentsValidatorMap = {
  fit: (argValue) => {
    const availableFitMap = ['contain', 'cover', 'fill', 'inside', 'outside']
    if (!availableFitMap.includes(argValue)) {
      throw new HttpException(
        422,
        `unknown resize argument "fit" value "${argValue}"`
      )
    }
    return argValue
  },
}

export default (resizeValue) => {
  if (!resizeValue) {
    throw new HttpException(422, `invalid crop value "${resizeValue}"`)
  }
  const [resizesWxH] = resizeValue.split(',')
  const resizes = resizesWxH.split('x')
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

  const optionalArguments = getOptionalArguments(
    optionalArgumentsValidatorMap,
    resizeValue,
    'resize'
  )

  return {
    width,
    height,
    fit: optionalArguments.fit,
  }
}
