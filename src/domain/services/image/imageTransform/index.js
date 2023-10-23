import HttpException from '#src/domain/exceptions/HttpException'
import sharp from 'sharp'
import sharpSmartCrop from 'smartcrop-sharp'

class ImageTransform {
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

  crop = this.declareExecution(async (transforms) => {
    const { crop } = transforms
    if (crop.position === 'smart') {
      const file = await this.sharpChain.clone().toBuffer()
      const value = await sharpSmartCrop.crop(file, {
        width: crop.width,
        height: crop.height,
      })
      const smartToCrop = value.topCrop
      const croppedImage = await this.sharpChain
        .extract({
          width: smartToCrop.width,
          height: smartToCrop.height,
          left: smartToCrop.x,
          top: smartToCrop.y,
        })
        .resize(crop.width, crop.height, {
          withoutReduction: true,
          withoutEnlargement: true,
        })
        .toBuffer()
      this.sharpChain = sharp(croppedImage)
    } else {
      const croppedImage = await this.sharpChain
        .resize(crop.width, crop.height, {
          position: crop.position || sharp.strategy.attention,
          fit: 'cover',
          withoutReduction: true,
          withoutEnlargement: true,
        })
        .toBuffer()
      this.sharpChain = sharp(croppedImage)
    }
  })

  resize = this.declareExecution(async (transforms) => {
    const { resize } = transforms
    const { width, height } = resize
    const defaultFit = width && height ? 'fill' : 'cover'
    const fit = resize.fit || defaultFit
    const resizedImage = await this.sharpChain
      .resize(width, height, {
        fit: fit,
        position: 'centre',
      })
      .toBuffer({ resolveWithObject: true })

    this.sharpChain = sharp(resizedImage.data)
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

  toFile = this.declareExecution(async (filename) => {
    await this.sharpChain.toFile(filename)
  })

  rotate = this.declareExecution((transforms) => {
    const angle = transforms?.rotate?.angle
    this.sharpChain.rotate(angle)
  })

  execute = async () => {
    await this.promises.reduce((p, fn) => p.then(fn), Promise.resolve())
    return
  }
}

function imageTransformFactory(imageBuffer) {
  return new ImageTransform(imageBuffer)
}

export default imageTransformFactory