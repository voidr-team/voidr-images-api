import HttpException from '#src/domain/exceptions/HttpException'
import sharp from 'sharp'
import sharpSmartCrop from 'smartcrop-sharp'

class ImageTransform {
  /** @type {sharp.Sharp} */
  sharpChain = null
  /** @type {ArrayBuffer} */
  imageBuffer = null

  constructor(imageBuffer) {
    this.sharpChain = sharp(imageBuffer)
    this.imageBuffer = imageBuffer
    this.promises = []
  }

  declareExecution =
    (fnc) =>
    (...args) => {
      this.promises.push(() => fnc(...args))
      return this
    }

  crop = this.declareExecution(async (width, height, options = {}) => {
    if (options.position === 'smart') {
      const file = await this.sharpChain.clone().toBuffer()
      const value = await sharpSmartCrop.crop(file, { width, height })
      const crop = value.topCrop
      this.sharpChain
        .extract({
          width: crop.width,
          height: crop.height,
          left: crop.x,
          top: crop.y,
        })
        .resize(width, height)
    } else {
      this.sharpChain.resize(width, height, {
        position: options.position || 'attention',
      })
    }
  })

  resize = this.declareExecution((width, height, options = {}) => {
    const defaultFit = width && height ? 'fill' : 'cover'
    const fit = options.fit || defaultFit
    this.sharpChain.resize(width, height, {
      fit: fit,
    })
  })

  transform = this.declareExecution((options = { format: 'webp' }) => {
    const availableFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif']
    if (!availableFormats.includes(options.format)) {
      throw new HttpException(422, `format ${options.format} not available`)
    }

    this.sharpChain[options.format]({
      quality: options.quality || 80,
    })
  })

  blur = this.declareExecution((sigma) => {
    if (sigma < 0.3 || sigma > 1000) {
      throw new HttpException(
        422,
        `blur ${sigma} needs to be between 0.3 and 1000`
      )
    }
    this.sharpChain.blur(sigma)
  })

  rounded = this.declareExecution(async (angle) => {
    const { info } = await this.sharpChain
      .clone()
      .png()
      .toBuffer({ resolveWithObject: true })
    const { width, height } = info

    const rect = Buffer.from(
      `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${angle}" ry="${angle}"/></svg>`
    )

    this.sharpChain
      .resize(width, height, { fit: 'cover' })
      .png()
      .composite([{ input: rect, blend: 'dest-in' }])
  })

  toFile = this.declareExecution((filename) => {
    this.sharpChain.toFile(filename)
  })

  rotate = this.declareExecution((angle) => {
    this.sharpChain.rotate(angle)
  })

  execute = async () => {
    return this.promises.reduce((p, fn) => p.then(fn), Promise.resolve())
  }
}

function imageTransformFactory(imageBuffer) {
  return new ImageTransform(imageBuffer)
}

export default imageTransformFactory
