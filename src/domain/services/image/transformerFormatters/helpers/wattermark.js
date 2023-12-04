import HttpException from '#src/domain/exceptions/HttpException'
import isValidHttpUrl from '#src/utils/string/isValidHttpUrl'
import getOptionalArguments from './getOptionalArguments'

const optionalArgumentsValidatorMap = {
  opacity: (argValue) => {
    const argValueNumber = Number(argValue)
    if (isNaN(argValueNumber)) {
      throw new HttpException(
        422,
        `invalid wattermark argument "opacity" value "${argValue}", it must be a number`
      )
    }

    return argValueNumber
  },
}

export default (wattermarkValue = '') => {
  if (!wattermarkValue) {
    throw new HttpException(422, `invalid crop value "${wattermarkValue}"`)
  }

  const [wattermarkSource] = wattermarkValue.split(',')

  if (!isValidHttpUrl(wattermarkSource)) {
    throw new HttpException(
      422,
      `invalid wattermark value "${wattermarkSource}", wattermark value must be an http url`
    )
  }

  const optionalArguments = getOptionalArguments(
    optionalArgumentsValidatorMap,
    wattermarkValue,
    'wattermark'
  )

  return {
    source: wattermarkSource,
    ...optionalArguments,
  }
}
