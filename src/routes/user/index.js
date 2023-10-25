import auth from '#src/middlewares/auth'
import express from 'express'
const router = express.Router()

router.get('/user/info', auth, async (req, res) => {
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
