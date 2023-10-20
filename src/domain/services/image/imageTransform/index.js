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

  crop = this.declareExecution(async (transforms) => {
    const { crop } = transforms
    if (crop.position === 'smart') {
      const file = await this.sharpChain.clone().toBuffer()
      const value = await sharpSmartCrop.crop(file, {
        width: crop.width,
        height: crop.height,
      })
      const smartToCrop = value.topCrop
      this.sharpChain
        .extract({
          width: smartToCrop.width,
          height: smartToCrop.height,
          left: smartToCrop.x,
          top: smartToCrop.y,
        })
        .resize(crop.width, crop.height)
    } else {
      this.sharpChain.resize(crop.width, crop.height, {
        position: crop.position || 'attention',
      })
    }
  })

  resize = this.declareExecution((transforms) => {
    const { resize } = transforms
    const { width, height } = resize
    const defaultFit = width && height ? 'fill' : 'cover'
    const fit = resize.fit || defaultFit
    this.sharpChain.resize(width, height, {
      fit: fit,
    })
  })

  compress = this.declareExecution((transforms) => {
    const availableFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif']
    const format = transforms?.convert?.format
    const quality = transforms?.compress?.quality
    if (!availableFormats.includes(format)) {
      throw new HttpException(422, `convert format "${format}" not available`)
    }

    this.sharpChain[format]({
      quality: quality || 80,
    })
  })

  blur = this.declareExecution((transforms) => {
    const sigma = transforms?.blur?.sigma
    if (sigma < 0.3 || sigma > 1000) {
      throw new HttpException(
        422,
        `blur value "${sigma}" needs to be between 0.3 and 1000`
      )
    }
    this.sharpChain.blur(sigma)
  })

  radius = this.declareExecution(async (transforms) => {
    let length = transforms?.radius?.length
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

  toFile = this.declareExecution((filename) => {
    this.sharpChain.toFile(filename)
  })

  rotate = this.declareExecution((transforms) => {
    const angle = transforms?.rotate?.angle
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
