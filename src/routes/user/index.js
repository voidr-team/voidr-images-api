import express from 'express'
const router = express.Router()

router.get('/user/info', async (req, res) => {
  console.log(req.auth)
  return res.json({
    auth: req.auth,
  })
})

export default router
