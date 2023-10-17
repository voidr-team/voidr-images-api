import yup from 'yup'

export const inviteSchema = yup.object().shape({
  email: yup.string().email().required(),
  roles: yup.array().of(yup.string()),
  name: yup.string().required(),
})

export const createOrganizationSchema = yup.object().shape({
  name: yup
    .string()
    .matches(/[a-z0-9_-]/i)
    .required()
    .min(3),
  displayName: yup.string().required().min(3),
  logo: yup.string().url().optional(),
})
