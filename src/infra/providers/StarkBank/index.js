import { head } from 'ramda'
import starkbank from 'starkbank'

class StarkBank {
  constructor(user) {
    this.user = user
  }

  async createInvoice(invoice) {
    let response = await starkbank.invoice.create([invoice], {
      user: this.user,
    })
    return head(response)
  }

  async getQRCode(invoiceId) {
    const qrcodeSize = 15
    let qrcode = await starkbank.invoice.qrcode(invoiceId, {
      size: qrcodeSize,
      user: this.user,
    })
    return Buffer.from(qrcode).toString('base64')
  }
}

export default StarkBank
