import yup from 'yup'

export const createProjectSchema = yup.object().shape({
  name: yup
    .string()
    .matches(/[a-z0-9_-]/i)
    .required()
    .min(3),
  domains: yup.array().of(yup.string()).required(),
  referral: yup.string().optional(),
})
export const updateProjectDomainsSchema = yup.object().shape({
  domains: yup.array().of(yup.string()).required(),
})
