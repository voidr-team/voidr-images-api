import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { customerSchema } from './schemas'
import customerRepository from '#src/infra/repositories/customerRepository'
const router = express.Router()

const onlyAdmin = (req, res, next) => {
  const adminKey = req.get('secret_key')
  if (adminKey === 'cEXpA12TIiqqQaBPzaWzvWaZqrwbNUY4') {
    return next()
  }

  return res.status(401).json({
    error: 'Unauthorized',
  })
}

router.post(
  '/customers',
  onlyAdmin,
  validateSchema(customerSchema),
  async (req, res) => {
    const customer = await customerRepository.create(req.body)
    res.status(201).json(customer)
  }
)

router.get('/customers/:id', async (req, res) => {
  const customer = await customerRepository.getById(req.params.id)
  res.status(200).json(customer)
})

export default router
