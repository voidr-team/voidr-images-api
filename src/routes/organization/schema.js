import yup from 'yup'

export const inviteSchema = yup.object().shape({
  email: yup.string().email().required(),
  roles: yup.array().of(yup.string()),
  name: yup.string().required(),
})
