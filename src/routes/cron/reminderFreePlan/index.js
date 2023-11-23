import projectRepository from '#src/infra/repositories/project'
import logger from '#src/domain/logger'
import SendGrid from '#src/infra/providers/SendGrid'
import express from 'express'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import getFirstNameOnly from '#src/utils/string/getFirstNameOnly'
import { isEmpty, count } from 'ramda'
import mktEmailLabels from '#src/utils/enums/mktEmailLabels'
import dayjs from 'dayjs'
const router = express.Router()

const TIMES_TO_SEND_REMINDER = 4

router.post('/cron/reminder-free-plan', async (req, res) => {
  const auth0Management = await auth0ManagementFactory()
  const freePlanProjectExpired = await projectRepository.getFreePlanExpired()
  logger.info('Get all projects successfully')

  const organizationIdsFromProjectsExpired = freePlanProjectExpired
    .filter((expiredProject) => {
      const hasReminder = (project) => {
        return project === mktEmailLabels.PERCENT_REMINDER_100
      }

      return (
        count(hasReminder, expiredProject.metadata.cadenceEmailSent) <
        TIMES_TO_SEND_REMINDER
      )
    })
    .filter((project) => {
      return (
        project.metadata.nextSend.date &&
        dayjs(project.metadata.nextSend.date).isSame(dayjs(), 'day')
      )
    })
    .map((project) => project.createdBy?.organizationId)

  if (isEmpty(organizationIdsFromProjectsExpired)) {
    return res.send()
  }

  for await (const organizationId of organizationIdsFromProjectsExpired) {
    const user = await auth0Management.getOrganizationMembers(organizationId)

    const allEmailsToNotify = user?.data
      ?.filter((member) => !member?.email.includes('@voidr.co'))
      .map((member) => ({
        email: member?.email,
        templateData: {
          first_name: getFirstNameOnly(member?.name),
        },
      }))

    const sendEmailPromise = SendGrid.sendEmail(
      SendGrid.emailTemplates.rememberHundredPercentFreeUsage,
      allEmailsToNotify
    )

    const updateProjectsPromises = freePlanProjectExpired.map(
      async (project) => {
        await projectRepository
          .updateProjectCadenceEmailSent(project._id, {
            cadenceEmailSent: mktEmailLabels.PERCENT_REMINDER_100,
            nextSend: {
              date: dayjs().add(7, 'days').toDate(),
              emailLabel: mktEmailLabels.PERCENT_REMINDER_100,
            },
          })
          .catch(() => {
            logger.error(`Unable to update project`, {
              projectId: project?._id,
              createdBy: project.createdBy,
            })
          })
      }
    )

    await Promise.all([sendEmailPromise, updateProjectsPromises])
  }

  return res.send()
})

export default router
