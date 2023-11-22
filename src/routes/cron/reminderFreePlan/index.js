import projectRepository from '#src/infra/repositories/project'
import logger from '#src/domain/logger'
import SendGrid from '#src/infra/providers/SendGrid'
import express from 'express'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import getFirstNameOnly from '#src/utils/string/getFirstNameOnly'
import { isEmpty } from 'ramda'
import cadenceMetadata from '#src/utils/enums/cadenceMetadata'
const router = express.Router()

router.post('/cron/reminder-free-plan', async (req, res) => {
  const auth0Management = await auth0ManagementFactory()
  const freePlanProjectExpired = await projectRepository.getFreePlanExpired()
  logger.info('Get all projects successfully')

  const organizationIdsFromProjectsExpired = freePlanProjectExpired
    .filter(
      (project) =>
        !project?.metadata?.cadenceEmailSent.includes(
          cadenceMetadata.PERCENT_REMINDER_100
        )
    )
    .map((project) => project?.createdBy?.organizationId)

  if (isEmpty(organizationIdsFromProjectsExpired)) {
    return res.send()
  }

  const usersFromOrganizations = await Promise.all(
    organizationIdsFromProjectsExpired.map(async (organizationId) => {
      try {
        const user = await auth0Management.getOrganizationMembers(
          organizationId
        )

        return user?.data
      } catch (error) {
        logger.error(
          `Organization: ${organizationId}. Unable to get users, error: `,
          error
        )
        return null
      }
    })
  )

  const allEmailsToNotify = usersFromOrganizations
    .flat()
    ?.filter((member) => !member?.email.includes('@voidr.co'))
    .map((member) => ({
      email: member?.email,
      templateData: {
        first_name: getFirstNameOnly(member?.name),
      },
    }))

  const sendEmailPromise = await SendGrid.sendEmail(
    SendGrid.emailTemplates.rememberHundredPercentFreeUsage,
    allEmailsToNotify
  )

  const updateProjectsPromises = freePlanProjectExpired.map(async (project) => {
    try {
      await projectRepository.updateProjectCadenceEmailSent(project._id, {
        cadenceEmailSent: cadenceMetadata.PERCENT_REMINDER_100,
      })
    } catch (error) {
      logger.error(
        `Project: ${project}, Unable to update project, error: `,
        error
      )
      return null
    }
  })

  await Promise.all([sendEmailPromise, updateProjectsPromises])

  return res.send()
})

export default router
