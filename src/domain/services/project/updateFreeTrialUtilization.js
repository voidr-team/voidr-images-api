import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import SendGrid from '#src/infra/providers/SendGrid'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import { ProjectSchema } from '#src/models/Project'
import { projectConfig } from '#src/models/Project/projectConfig'
import mktEmailLabels from '#src/utils/enums/mktEmailLabels'
import getFirstNameOnly from '#src/utils/string/getFirstNameOnly'
import dayjs from 'dayjs'

/**
 * @param {ProjectSchema} project
 */
const updateFreeTrialUtilization = async (project) => {
  if (project.plan !== projectConfig.plans.FREE) return
  const organizationFromProject = project?.createdBy.organizationId
  const auth0Management = await auth0ManagementFactory()
  const imagesQnty = await imageRepository.countByProject(project.name)
  const usageLimit = project.freePlan?.usageLimit || 1000

  const { data: members } = await auth0Management.getOrganizationMembers(
    organizationFromProject
  )

  const emailsFromOrganizationMembers = members
    ?.filter((member) => !member?.email.includes('@voidr.co'))
    .map((member) => ({
      email: member?.email,
      templateData: {
        first_name: getFirstNameOnly(member?.name),
      },
    }))

  // That's 80%
  if (
    imagesQnty >= usageLimit * 0.8 &&
    !project?.metadata?.cadenceEmailSent?.includes(
      mktEmailLabels.PERCENT_QUOTA_80
    )
  ) {
    const sendEmail = SendGrid.sendEmail(
      SendGrid.emailTemplates.eightyPercentFreeUsage,
      emailsFromOrganizationMembers
    )

    const updateProject = projectRepository.updateProjectCadenceEmailSent(
      project._id,
      {
        cadenceEmailSent: mktEmailLabels.PERCENT_QUOTA_80,
      }
    )

    await Promise.all([sendEmail, updateProject])
  }

  if (imagesQnty >= usageLimit) {
    const updateFreePlanExpiredPromise =
      projectRepository.updateFreePlanExpired(project._id)

    const sendEmailPromise = SendGrid.sendEmail(
      SendGrid.emailTemplates.hundredPercentFreeUsage,
      emailsFromOrganizationMembers
    )

    const updateProjectCadenceEmailSentPromise =
      projectRepository.updateProjectCadenceEmailSent(project._id, {
        cadenceEmailSent: mktEmailLabels.PERCENT_QUOTA_100,
        nextSend: {
          date: dayjs().add(3, 'days').toDate(),
          emailLabel: mktEmailLabels.PERCENT_REMINDER_100,
        },
      })

    await Promise.all([
      updateFreePlanExpiredPromise,
      sendEmailPromise,
      updateProjectCadenceEmailSentPromise,
    ])
  }
}

export default updateFreeTrialUtilization
