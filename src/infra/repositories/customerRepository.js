import { Customer } from '#models/Customer'
import crypto from 'crypto'
import slugify from 'slugify'

const create = async ({ ...customerData }) => {
  let slug =
    customerData.slug ||
    slugify(customerData.name, { lower: true, strict: true, replacement: '_' })

  try {
    const customer = new Customer({
      ...customerData,
      slug,
    })
    await customer.save()
    return customer
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      slug = `${slug}_${crypto.randomBytes(3).toString('hex')}`
      return create({ ...customerData, slug })
    } else {
      throw error
    }
  }
}

const getById = async (id) => {
  const customer = await Customer.findById(id).exec()
  return customer
}

export default {
  create,
  getById,
}
