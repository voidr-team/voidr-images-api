import config from '#src/config'
import logger from '#src/domain/logger'
import axios from 'axios'
import emailTemplates from './templates'

/**
 * @param {string} email
 * @param {Object} templateData
 */
const getEmailPersonalization = ({ email, templateData }) => ({
  to: [
    {
      email: email,
    },
  ],
  dynamic_template_data: templateData,
  asm: {
    group_id: 25314,
    groups_to_display: [25314],
  },
})

/**
 * @param {string} onboardingTemplateId
 * @param {Object} emailData
 * @param {Object} from
 */
async function sendEmail(
  onboardingTemplateId,
  emailData,
  from = {
    email: 'info@noreply.voidr.co',
    name: 'voidr',
  }
) {
  try {
    const personalizations = Array.isArray(emailData)
      ? emailData.map(getEmailPersonalization)
      : [getEmailPersonalization(emailData)]

    const response = await axios.post(
      `${config.EMAIL.EMAIL_SERVICE_URL}/mail/send`,
      {
        from,
        personalizations,
        template_id: onboardingTemplateId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.EMAIL.EMAIL_SERVICE_KEY}`,
        },
      }
    )

    if (![200, 202].includes(response.status)) {
      logger.error(response)
      throw new Error('Failed to send email.')
    }

    return response.data
  } catch (error) {
    logger.error(error)
    throw new Error('Failed to send email.')
  }
}

const SendGrid = { sendEmail, emailTemplates }

export default SendGrid
