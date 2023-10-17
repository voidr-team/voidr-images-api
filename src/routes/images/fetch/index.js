import downloadImageStream from '#src/utils/request/downloadImageStream'
import express from 'express'
import sharp from 'sharp'
import fs, { write } from 'fs'
const router = express.Router()

router.get('/images/:transforms/fetch/:remote(*)', async (req, res) => {
  console.log(req.params.transforms)
  console.log(req.params.remote)
  const { transforms, remote } = req.params

  const sharpStream = sharp()
  sharpStream.webp({ quality: 80 })

  sharpStream.resize({ width: 100 })

  sharpStream.toFile('image.webp')

  // const writeStream = fs.createWriteStream('write.webp')

  const imageStream = await downloadImageStream(remote)

  imageStream
    .pipe(sharpStream)
    .on('finish', () => {
      console.log('aaa')
      return res.send('ok')
    })
    .on('error', function (err) {
      throw err
    })
})

export default router
