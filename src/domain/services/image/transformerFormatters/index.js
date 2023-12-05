import HttpException from '#src/domain/exceptions/HttpException'
import crop from './helpers/crop'
import radius from './helpers/radius'
import resize from './helpers/resize'
import rotate from './helpers/rotate'
import convert from './helpers/convert'
import compress from './helpers/compress'
import blur from './helpers/blur'
import watermark from './helpers/watermark'

const transformFormatterMap = {
  crop,
  radius,
  resize,
  rotate,
  convert,
  compress,
  blur,
  watermark,
}

const availableTransformers = Object.keys(transformFormatterMap)

const formatValueByTransformer = (keyword, transformerValue, raw) => {
  return transformFormatterMap[keyword](transformerValue, keyword, raw)
}

const getwatermarkParam = (transformer) => {
  const transformersRegexStr = Object.keys(transformFormatterMap).join('|\\/')

  const transformerRegex = new RegExp(
    `watermark:(.*?)(?=\\/${transformersRegexStr}|$)`
  )

  const watermarkMatches = transformer.match(transformerRegex)
  if (!watermarkMatches) {
    throw new HttpException(
      422,
      'unexpected watermark format, it must be similar to "watermark:https://cdn.com/my-watermark"'
    )
  }
  return watermarkMatches[0]
}

const splitParams = (transformers = '') => {
  let transformersTrimmed = transformers.trim()
  let params = []
  if (transformers.includes('watermark')) {
    const watermarkParam = getwatermarkParam(transformersTrimmed)
    params.push(watermarkParam)
    transformersTrimmed = transformersTrimmed.replace(watermarkParam, '')
  }
  const othersParams = transformersTrimmed.split('/').filter((param) => !!param)
  return [...params, ...othersParams]
}

const splitToObject = (transformers) => {
  const parsedTransformers = splitParams(transformers).reduce(
    (prev, current) => {
      const [transformerKeyWord, ...values] = current.split(':')
      const transformerValue = values.join(':')
      if (!availableTransformers.includes(transformerKeyWord)) {
        throw new HttpException(
          422,
          `unknown transformer "${transformerKeyWord}"`
        )
      }

      return {
        ...prev,
        [transformerKeyWord]: formatValueByTransformer(
          transformerKeyWord,
          transformerValue
        ),
      }
    },
    {}
  )
  return parsedTransformers
}

const formatFromParams = (transformersString) => {
  const transformersObject = splitToObject(transformersString)
  return transformersObject
}

// TODO: Set manually order of all transformer
const getTransformersPipeline = (transformersString) => {
  let keyWords = splitParams(transformersString).map((param) => {
    const [keyword] = param.split(':')
    return keyword
  })

  // compress and convert are the same task
  if (keyWords.includes('compress') || keyWords.includes('convert')) {
    const othersTransformers = keyWords.filter(
      (keyword) => !['compress', 'convert'].includes(keyword)
    )
    // compress needs to run first
    keyWords = ['compress', ...othersTransformers]
  }

  if (keyWords.includes('radius')) {
    const othersTransformers = keyWords.filter(
      (keyword) => !['radius'].includes(keyword)
    )

    keyWords = [...othersTransformers, 'radius']
  }

  return [...keyWords]
}

export default {
  formatFromParams,
  getTransformersPipeline,
}
