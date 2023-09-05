import yup from 'yup'

export const createVendorSchema = yup.object().shape({
  website: yup.string().required(),
  name: yup.string().required(),
  categories: yup.array().of(yup.string()).required(),
  contract: yup.object().shape({
    value: yup.number().positive().required(),
  }),
  interestTeam: yup.string().required(),
  contacts: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required(),
        email: yup.string().email().required(),
      })
    )
    .required(),
  organizationId: yup.string().optional(),
})
