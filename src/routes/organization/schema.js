import yup from 'yup'

const inviteSchema = yup.object().shape({
  email: yup.string().email().required(),
  roles: yup.array().of(yup.string()),
  name: yup.string().required(),
})

export default inviteSchema
