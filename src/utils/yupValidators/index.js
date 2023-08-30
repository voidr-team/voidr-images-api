import { cnpj, cpf } from 'cpf-cnpj-validator'
import yup from 'yup'

export const yupCnpjValidator = yup
  .string()
  .required()
  .test('is-cnpj', '${path} must be a valid CNPJ', cnpj.isValid)
  .transform(cnpj.format)

export const yupCpfValidator = yup
  .string()
  .required()
  .test('is-cpf', '${path} must be a valid CPF', cpf.isValid)
  .transform(cpf.format)

export const yupCpfCnpjValidator = yup
  .string()
  .required()
  .test(
    'is-cpf-or-cnpj',
    '${path} must be a valid CPF or CNPJ',
    (value) => cpf.isValid(value) || cnpj.isValid(value)
  )
  .transform((value) =>
    cpf.isValid(value) ? cpf.format(value) : cnpj.format(value)
  )
