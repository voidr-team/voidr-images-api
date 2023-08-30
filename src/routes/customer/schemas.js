import { customerConfig } from '#src/infra/models/Customer/customerConfig'
import yup from 'yup'
import { cnpj } from 'cpf-cnpj-validator'

const isCNPJ = (str) => cnpj.isValid(str)

export const customerSchema = yup.object().shape({
  name: yup.string().required(),
  taxId: yup
    .string()
    .required()
    .test('is-cnpj', '${path} must be a valid CNPJ', isCNPJ)
    .transform((value) => cnpj.format(value)),
  corporateName: yup.string().nullable(),
  address: yup.object().shape({
    street: yup.string().nullable(),
    city: yup.string().nullable(),
    state: yup.string().nullable(),
    country: yup.string().nullable(),
    zip: yup
      .string()
      .matches(/^\d{5}-\d{3}$/)
      .nullable(),
  }),
  status: yup.string().oneOf([Object.values(customerConfig.status)]),
})
