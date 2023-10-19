import express from 'express'
import sharp from 'sharp'
import fs, { write } from 'fs'
import getStorage from '#src/utils/storage/getStorage'
import imageTransformFactory from '#src/domain/services/image/imageTransform'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
const router = express.Router()

router.get(
  '/images/:project/:transforms(*)/fetch/:remote(*)',
  async (req, res) => {
    const { transforms = '', remote, project } = req.params

    const parsedTransforms = transforms
      .trim()
      .split('/')
      .reduce((prev, current) => {
        if (!current) return prev
        const [transformerKeyWord, transformerValue] = current.split(':')
        return {
          ...prev,
          [transformerKeyWord]: transformerValue,
        }
      }, {})

    const imageBuffer = await downloadImageBuffer(remote)
    const imageTransformer = imageTransformFactory(imageBuffer)
    console.log({
      transforms: parsedTransforms,
      remote,
      project,
    })

    await imageTransformer
      .crop(900, 900, { position: 'smart' })
      .transform({ format: 'webp', quality: 80 })
      .rounded('50%')
      .toFile('test3.webp')
      .execute()

    return res.send({
      transforms: parsedTransforms,
      remote,
      project,
    })

    // const sharpStream = sharp()
    // sharpStream.webp({ quality: 80 })

    // const storage = getStorage()
    // const bucket = storage.bucket('voidr_images_test')
    // const bucketFile = bucket.file('test.webp')
    // const bucketFileWStream = bucketFile.createWriteStream()
    // imageStream
    //   .pipe(sharpStream)
    //   .pipe(bucketFileWStream)
    //   .on('finish', async () => {
    //     const fileRead = bucketFile.createReadStream()
    //     let headers = {
    //       'Content-disposition': 'attachment; filename="' + 'test.webp' + '"',
    //       'Content-Type': 'image/webp',
    //     }
    //     res.status(200).set(headers)
    //     fileRead.pipe(res)
    //   })
    //   .on('error', function (err) {
    //     throw err
    //   })
  }
)

export default router
