import express from 'express'
import { basicAuthCheck } from '#src/middlewares/authCheck'
import validateSchema from '#src/middlewares/validateSchema'
import accountSchema from './schema'
import accountRepository from '#src/infra/repositories/accountRepository'
const router = express.Router()

router.post('/accounts', validateSchema(accountSchema), async (req, res) => {
  const account = await accountRepository.create(req.body)
  res.status(201).json(account)
})

router.get('/accounts/info', basicAuthCheck, async (req, res) => {
  const account = req.account

  res.status(200).json(account)
})

export default router
