import HttpException from '#src/domain/exceptions/HttpException'
import isValidHttpUrl from '#src/utils/string/isValidHttpUrl'
import sharp from 'sharp'
import getOptionalArguments from './getOptionalArguments'

const optionalArgumentsValidatorMap = {
  opacity: (argValue) => {
    const argValueNumber = Number(argValue)
    if (isNaN(argValueNumber)) {
      throw new HttpException(
        422,
        `invalid watermark argument "opacity" value "${argValue}", it must be a number`
      )
    }

    return argValueNumber
  },
  position: (argValue) => {
    const availablePositionMap = [...Object.keys(sharp.gravity)]

    if (!availablePositionMap.includes(argValue)) {
      throw new HttpException(
        422,
        `unknown watermark argument "position" value "${argValue}"`
      )
    }
    return argValue
  },
  size: (argValue) => {
    if (!argValue) {
      throw new HttpException(
        422,
        `invalid watermark argument "size" value ${argValue}`
      )
    }

    const isPercent = argValue.endsWith('p')
    if (isPercent) {
      const parcentValue = Number(argValue.replace('p', ''))
      if (isNaN(parcentValue) || parcentValue < 0 || parcentValue > 100) {
        throw new HttpException(
          422,
          `watermark size percent value must be between 0 and 100, watermark size value must be similar to "50p", "1200x200", "1200x" or "x200"`
        )
      }
      return {
        percent: parcentValue / 100,
      }
    }

    const sizes = argValue.split('x')
    const [widthStr, heightStr] = sizes
    const width = widthStr ? Number(widthStr) : undefined
    const height = heightStr ? Number(heightStr) : undefined

    if (
      sizes.length !== 2 ||
      (!width && !height) ||
      (!heightStr && !widthStr)
    ) {
      throw new HttpException(
        422,
        `invalid watermark size value "${argValue}", watermark size value must be similar to "50p", "1200x200", "1200x" or "x200"`
      )
    }

    return {
      width,
      height,
    }
  },
}

export default (watermarkValue = '') => {
  if (!watermarkValue) {
    throw new HttpException(422, `invalid watermark value "${watermarkValue}"`)
  }

  const [watermarkSource] = watermarkValue.split(',')

  if (!isValidHttpUrl(watermarkSource)) {
    throw new HttpException(
      422,
      `invalid watermark value "${watermarkSource}", watermark value must be an http url`
    )
  }

  const optionalArguments = getOptionalArguments(
    optionalArgumentsValidatorMap,
    watermarkValue,
    'watermark'
  )

  return {
    source: watermarkSource,
    ...optionalArguments,
  }
}
