import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import { isEmpty, isNil, isNotNil } from 'ramda'
import sharp from 'sharp'

export class ImageTransform {
  /** @type {sharp.Sharp} */
  sharpChain = null
  promises = []

  /** @type {sharp.Metadata | null} */
  rawImageMetadata = null

  /** @type {sharp.Metadata | null} */
  imageMetadata = null

  constructor(imageBuffer) {
    this.sharpChain = sharp(imageBuffer)
    this.promises = []
  }

  declareExecution =
    (fnc) =>
    (...args) => {
      this.promises.push(() => fnc(...args))
      return this
    }

  crop = this.declareExecution(async (transformers) => {
    const { crop } = transformers
    await this.sharpChain.resize(crop.width, crop.height, {
      position: crop.position || sharp.strategy.attention,
      fit: 'cover',
      withoutReduction: true,
      withoutEnlargement: true,
    })
  })

  resize = this.declareExecution(async (transformers) => {
    const { resize } = transformers
    const { width, height } = resize
    const defaultFit = 'cover'
    const fit = resize.fit || defaultFit
    await this.sharpChain.resize(width, height, {
      fit: fit,
      position: 'centre',
    })
  })

  compress = this.declareExecution((transformers) => {
    const availableFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif']
    const format = transformers?.convert?.format || 'webp'
    const quality =
      transformers?.compress?.quality === 'smart'
        ? 90
        : transformers?.compress?.quality

    if (!availableFormats.includes(format)) {
      throw new HttpException(422, `convert format "${format}" not available`)
    }

    this.sharpChain[format]({
      quality: quality || 100,
    })
  })

  blur = this.declareExecution((transformers) => {
    const sigma = transformers?.blur?.sigma
    if (sigma < 0.3 || sigma > 1000) {
      throw new HttpException(
        422,
        `blur value "${sigma}" needs to be between 0.3 and 1000`
      )
    }
    this.sharpChain.blur(sigma)
  })

  radius = this.declareExecution(async (transformers) => {
    let length = transformers?.radius?.length
    const { info } = await this.sharpChain
      .clone()
      .png()
      .toBuffer({ resolveWithObject: true })
    const { width, height } = info

    if (length.endsWith('p')) {
      length = length.replace('p', '%')
    }

    const rect = Buffer.from(
      `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${length}" ry="${length}"/></svg>`
    )

    this.sharpChain.png().composite([{ input: rect, blend: 'dest-in' }])
  })

  toFile = this.declareExecution(async (filename) => {
    await this.sharpChain.toFile(filename)
  })

  rotate = this.declareExecution((transformers) => {
    const angle = transformers?.rotate?.angle
    this.sharpChain.rotate(angle)
  })

  execute = async () => {
    await this.promises.reduce((p, fn) => p.then(fn), Promise.resolve())
    this.imageMetadata = (await this.bufferWithMetadata()).info
    return
  }

  pipe = (...args) => this.sharpChain.pipe(...args)

  watermark = async (transformers) => {
    const watermarkSource = transformers?.watermark?.source
    const opacity = isNil(transformers?.watermark?.opacity)
      ? 1
      : transformers?.watermark?.opacity

    const watermarkSharp = sharp(
      await downloadImageBuffer(watermarkSource)
    ).composite([
      {
        input: Buffer.from([255, 255, 255, 255 * opacity]),
        raw: {
          width: 1,
          height: 1,
          channels: 4,
        },
        tile: true,
        blend: 'dest-in',
      },
    ])

    const hasSizes =
      transformers?.watermark?.size?.width ||
      transformers?.watermark?.size?.height

    let width, height

    if (hasSizes) {
      width = transformers?.watermark?.size?.width
      height = transformers?.watermark?.size?.height
    } else {
      const sizePercent = transformers?.watermark?.size?.percent || 0.5
      width = this.imageMetadata.width * sizePercent
      height = this.imageMetadata.height * sizePercent
    }

    watermarkSharp.resize(width, height, {
      fit: 'cover',
      position: 'centre',
    })

    const watterarkBuffer = await watermarkSharp.toBuffer()

    this.sharpChain.composite([
      {
        input: watterarkBuffer,
        gravity: transformers?.watermark?.position || 'centre',
      },
    ])
  }

  bufferWithMetadata = () =>
    this.sharpChain.toBuffer({ resolveWithObject: true })

  setRawImageMetadata = async () => {
    const rawImageMetadata = (await this.bufferWithMetadata()).info
    this.rawImageMetadata = rawImageMetadata
  }
}

async function imageTransformFactory(imageBuffer) {
  const imageTransform = new ImageTransform(imageBuffer)
  await imageTransform.setRawImageMetadata()
  return imageTransform
}

export default imageTransformFactory
