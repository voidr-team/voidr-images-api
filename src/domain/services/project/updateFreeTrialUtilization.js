import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import { ProjectSchema } from '#src/models/Project'
import { projectConfig } from '#src/models/Project/projectConfig'

/**
 * @param {ProjectSchema} project
 */
const updateFreeTrialUtilization = async (project) => {
  if (project.plan !== projectConfig.plans.FREE) return

  const imagesQnty = await imageRepository.countByProject(project.name)
  if (imagesQnty > 1000) {
    await projectRepository.updateFreePlanExpired(project._id)
  }
}

export default updateFreeTrialUtilization
