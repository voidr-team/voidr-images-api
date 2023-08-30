export const paymentConfig = {
  modelName: 'payment',
  status: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    PROCESSED: 'PROCESSED',
    FAILED: 'FAILED',
  },
  method: {
    TRANSFER: 'TRANSFER',
    BOLETO: 'BOLETO',
    QR_CODE: 'QR_CODE',
    UTILITY: 'UTILITY',
    TAX: 'TAX',
    DARF: 'DARF',
  },
}
