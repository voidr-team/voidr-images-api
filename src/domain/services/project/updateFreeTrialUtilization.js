import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import SendGrid from '#src/infra/providers/SendGrid'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import { ProjectSchema } from '#src/models/Project'
import { projectConfig } from '#src/models/Project/projectConfig'
import cadenceMetadata from '#src/utils/enums/cadenceMetadata'
import getFirstNameOnly from '#src/utils/string/getFirstNameOnly'

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
    imagesQnty * 0.8 >= usageLimit &&
    !project?.metadata?.cadenceEmailSent?.includes(
      cadenceMetadata.PERCENT_QUOTA_80
    )
  ) {
    const sendEmail = SendGrid.sendEmail(
      SendGrid.emailTemplates.eightyPercentFreeUsage,
      emailsFromOrganizationMembers
    )

    const updateProject = projectRepository.updateProjectMetadata(project._id, {
      cadenceEmailSent: cadenceMetadata.PERCENT_QUOTA_80,
    })

    await Promise.all([sendEmail, updateProject])
  }

  if (imagesQnty > usageLimit) {
    const updateFreePlanExpiredPromise =
      projectRepository.updateFreePlanExpired(project._id)

    const sendEmailPromise = SendGrid.sendEmail(
      SendGrid.emailTemplates.hundredPercentFreeUsage,
      emailsFromOrganizationMembers
    )

    const updateProjectMetadataPromise =
      projectRepository.updateProjectMetadata(project._id, {
        cadenceEmailSent: cadenceMetadata.PERCENT_QUOTA_100,
      })

    await Promise.all([
      updateFreePlanExpiredPromise,
      sendEmailPromise,
      updateProjectMetadataPromise,
    ])
  }
}

export default updateFreeTrialUtilization
