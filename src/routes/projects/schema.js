import yup from 'yup'

export const createProjectSchema = yup.object().shape({
  name: yup.string().required(),
  domains: yup.array().of(yup.string()).required(),
})
