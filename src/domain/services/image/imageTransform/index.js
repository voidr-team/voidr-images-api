import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import { isNil } from 'ramda'
import sharp from 'sharp'

export class ImageTransform {
  /** @type {sharp.Sharp} */
  sharpChain = null

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
    return
  }

  pipe = (...args) => this.sharpChain.pipe(...args)

  wattermark = this.declareExecution(async (transformers) => {
    const wattermarkSource = transformers?.wattermark?.source
    const opacity = isNil(transformers?.wattermark?.opacity)
      ? 1
      : transformers?.wattermark?.opacity

    const watterarkBuffer = await sharp(
      await downloadImageBuffer(wattermarkSource)
    )
      .composite([
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
      .toBuffer()
    this.sharpChain.composite([
      {
        input: watterarkBuffer,
        gravity: transformers?.wattermark?.position || 'centre',
      },
    ])
  })

  bufferWithMetadata = () =>
    this.sharpChain.toBuffer({ resolveWithObject: true }).catch((e) => {
      if (
        e.message?.includes(
          'Image to composite must have same dimensions or smaller'
        )
      ) {
        throw new HttpException(
          422,
          'wattermark image dimensions must be smaller than the source image'
        )
      }
      throw e
    })
}

function imageTransformFactory(imageBuffer) {
  return new ImageTransform(imageBuffer)
}

export default imageTransformFactory
