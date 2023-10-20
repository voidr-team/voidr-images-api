import express from 'express'
import sharp from 'sharp'
import fs, { write } from 'fs'
import getStorage from '#src/utils/storage/getStorage'
import imageTransformFactory from '#src/domain/services/image/imageTransform'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import transformerFormatters from '#src/domain/services/image/transformerFormatters'
const router = express.Router()

router.get(
  '/images/:project/:transforms(*)/fetch/:remote(*)',
  async (req, res) => {
    const { transforms = '', remote, project } = req.params

    const parsedTransforms = transformerFormatters.formatFromParams(transforms)
    const transformPipeline =
      transformerFormatters.getTransformersPipeline(transforms)

    const imageBuffer = await downloadImageBuffer(remote)

    const imageTransformer = imageTransformFactory(imageBuffer)

    transformPipeline.forEach((task) => {
      imageTransformer[task](parsedTransforms)
    })

    await imageTransformer.toFile('test3.webp').execute()

    return res.send({
      transforms: parsedTransforms,
      remote,
      transformPipeline,
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
