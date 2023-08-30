import yup from 'yup'

const accountSchema = yup.object().shape({
  accountName: yup.string().required(),
  accountDescription: yup.string().notRequired(),
  customerId: yup.string().required(),
})

export default accountSchema
