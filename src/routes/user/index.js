import express from 'express'
const router = express.Router()

router.get('/user/info', async (req, res) => {
  const payload = req.auth.payload
  const { organization, roles, sub, user } = payload
  return res.json({
    organization,
    roles,
    sub,
    ...user,
  })
})

export default router
