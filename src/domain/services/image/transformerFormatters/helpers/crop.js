import HttpException from '#src/domain/exceptions/HttpException'
import sharp from 'sharp'

const optionalArgumentsValidatorMap = {
  x: (argValue) => {
    const argValueNumber = Number(argValue)
    if (isNaN(argValueNumber)) {
      throw new HttpException(
        422,
        `invalid crop argument "x" value "${argValue}", it must be a number`
      )
    }
    return argValueNumber
  },
  y: (argValue) => {
    const argValueNumber = Number(argValue)
    if (isNaN(argValueNumber)) {
      throw new HttpException(
        422,
        `invalid crop argument "y" value "${argValue}", it must be a number`
      )
    }
    return argValueNumber
  },
  position: (argValue) => {
    const availablePositionMap = [
      ...Object.keys(sharp.gravity),
      ...Object.keys(sharp.strategy),
    ]
    if (!availablePositionMap.includes(argValue)) {
      throw new HttpException(
        422,
        `unknown crop argument "position" value "${argValue}"`
      )
    }

    return argValue
  },
}

const availableOptionalArguments = Object.keys(optionalArgumentsValidatorMap)

export default (cropValue) => {
  if (!cropValue) {
    throw new HttpException(422, `invalid crop value "${cropValue}"`)
  }

  const [widthAndHeightArgs, ...optionals] = cropValue.split(',')

  const crops = widthAndHeightArgs.split('x')
  const [widthStr, heightStr] = crops
  const width = widthStr ? Number(widthStr) : undefined
  const height = heightStr ? Number(heightStr) : undefined

  const isNaNSafety = (n) => n.toString() === 'NaN'

  if (
    crops.length !== 2 ||
    isNaNSafety(width) ||
    isNaNSafety(height) ||
    (!width && !height) ||
    (!heightStr && !widthStr)
  ) {
    throw new HttpException(
      422,
      `invalid crop value "${cropValue}", crop value must be similar to "920x470" or "920x" or "x940"`
    )
  }

  const optionalArguments = optionals.reduce((prev, argument) => {
    const [argKeyword, argValue] = argument.split(':')
    const invalidArgument = !availableOptionalArguments.includes(argKeyword)

    if (invalidArgument) {
      throw new HttpException(
        422,
        `invalid crop optional argument "${invalidArgument}"`
      )
    }

    return {
      ...prev,
      [argKeyword]: optionalArgumentsValidatorMap[argKeyword](argValue),
    }
  }, {})

  if (
    optionalArguments.position &&
    (optionalArguments.x || optionalArguments.y)
  ) {
    throw new HttpException(
      422,
      `invalid crop optional arguments, you can not use position and coordinates at the same time`
    )
  }
  return {
    ...optionalArguments,
    width,
    height,
  }
}
