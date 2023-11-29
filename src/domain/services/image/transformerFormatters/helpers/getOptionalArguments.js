import HttpException from '#src/domain/exceptions/HttpException'

const getOptionalArguments = (
  optionalArgumentsValidatorMap,
  transformerArgument,
  transformName
) => {
  const availableOptionalArguments = Object.keys(optionalArgumentsValidatorMap)
  const [_, ...optionals] = transformerArgument.split(',')

  const optionalArguments = optionals.reduce((prev, argument) => {
    const [argKeyword, argValue] = argument.split(':')
    const invalidArgument = !availableOptionalArguments.includes(argKeyword)

    if (invalidArgument) {
      throw new HttpException(
        422,
        `invalid ${transformName} optional argument "${invalidArgument}"`
      )
    }

    return {
      ...prev,
      [argKeyword]: optionalArgumentsValidatorMap[argKeyword](argValue),
    }
  }, {})

  return optionalArguments
}

export default getOptionalArguments
