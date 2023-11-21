import config from '#src/config'
import logger from '#src/domain/logger'
import request from 'request'
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
  let personalizations = Array.isArray(emailData)
    ? emailData.map(getEmailPersonalization)
    : [getEmailPersonalization(emailData)]
  return new Promise((resolve, reject) => {
    request(
      {
        url: `${config.EMAIL.EMAIL_SERVICE_URL}/mail/send`,
        method: 'POST',
        body: JSON.stringify({
          from,
          personalizations: personalizations,
          template_id: onboardingTemplateId,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.EMAIL.EMAIL_SERVICE_KEY}`,
        },
      },
      function (err, r, body) {
        if (err) {
          logger.error(err)
          return reject(err)
        }

        if (!/(200|202)/.test(r.statusCode)) {
          logger.error(r, body)
          return reject()
        }

        return resolve()
      }
    )
  })
}

const SendGrid = { sendEmail, emailTemplates }

export default SendGrid
