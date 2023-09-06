import { paymentConfig } from '#models/Payment/paymentConfig'
import { yupCpfCnpjValidator } from '#src/utils/yupValidators'
import yup from 'yup'

const methodSchema = yup
  .string()
  .oneOf(Object.values(paymentConfig.method))
  .required()

const transferSchema = yup.object().shape({
  method: methodSchema,
  amount: yup.number().integer().positive().required(), // a principio será required
  name: yup.string().required(),
  taxId: yupCpfCnpjValidator,
  bankCode: yup
    .string()
    .required()
    .test(
      'pix-or-ted',
      'If you wish to send a Pix, pass the bank ISPB (8 digits). Example: 20018183. If you wish to send a TED, pass the usual bank code (1 to 3 digits). Example: 341',
      (value) => {
        if (value.length === 8) {
          return true
        }
        if (value.length >= 1 && value.length <= 3) {
          return true
        }
        return false
      }
    ),
  branchCode: yup.string().required(),
  accountNumber: yup.string().required(),
  accountType: yup
    .string()
    .oneOf(['checking', 'savings', 'salary'])
    .default('checking'),
  description: yup.string(),
  scheduled: yup.date(),
})

const qrCodePaymentSchema = yup.object().shape({
  method: methodSchema,
  brcode: yup.string().required(),
  taxId: yupCpfCnpjValidator,
  description: yup.string().required().min(10),
  amount: yup.number().integer().positive().required(), // a principio será required
  scheduled: yup.date(),
})

const boletoPaymentSchema = yup
  .object()
  .shape({
    method: methodSchema,
    line: yup
      .string()
      .test(
        'line',
        'Line is required when barCode is not provided',
        (value, ctx) => {
          const { barCode } = ctx.parent
          return value || barCode
        }
      ),
    barCode: yup
      .string()
      .test(
        'barCode',
        'BarCode is required when line is not provided',
        (value, ctx) => {
          const { line } = ctx.parent
          return value || line
        }
      ),
    taxId: yupCpfCnpjValidator,
    description: yup
      .string()
      .required()
      .min(10, 'description should have minimum length of 10'),
    scheduled: yup.date(),
    amount: yup.number().integer().positive().required(), // a principio será required
  })
  .test(
    'line-barCode-match',
    'line and barCode must match if both are provided',
    (value) => {
      const { line, barCode } = value
      return line === barCode || !line || !barCode
    }
  )

const darfPayment = yup.object().shape({
  method: methodSchema,
  description: yup
    .string()
    .required()
    .min(10, 'description should have minimum length of 10'),
  revenueCode: yup
    .string()
    .required()
    .length(4, 'revenueCode must have exactly 4 digits'),
  taxId: yupCpfCnpjValidator,
  competence: yup.date().required(),
  nominalAmount: yup.number().integer().positive().required(),
  fineAmount: yup.number().integer().positive().required(),
  interestAmount: yup.number().integer().positive().required(),
  due: yup.date().required(),
  scheduled: yup.date(),
})

const payerSchema = yup.object().shape({
  name: yup.string().required(),
  taxId: yupCpfCnpjValidator,
})

export const batchPaymentSchema = yup.object().shape({
  payer: payerSchema,
  payments: yup.array().of(
    yup.lazy((value) => {
      switch (value.method) {
        case paymentConfig.method.TRANSFER:
          return transferSchema
        case paymentConfig.method.QR_CODE:
          return qrCodePaymentSchema
        case paymentConfig.method.BOLETO:
        case paymentConfig.method.UTILITY:
        case paymentConfig.method.TAX:
          return boletoPaymentSchema
        case paymentConfig.method.DARF:
          return darfPayment
        default:
          return yup.object().shape({
            method: methodSchema,
          })
      }
    })
  ),
})
