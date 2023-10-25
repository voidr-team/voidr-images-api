import { Project, ProjectSchema } from '#models/Project'

/**
 * @param {Issuer} issuer
 * @param {ProjectSchema} raw
 */
const create = async (issuer, raw) => {
  const newProject = new Project({
    ...raw,
    createdBy: {
      organizationId: issuer.organizationId,
      sub: issuer.sub,
    },
  })
  return (await newProject.save()).toObject()
}

/** @param {Issuer} issuer */
const list = async (issuer) => {
  const projects = await Project.find({
    'createdBy.organizationId': issuer.organizationId,
  }).exec()
  return projects
}

/** @param {string} projectName */
const exists = async (projectName) => {
  const existsProject = await Project.exists({ name: projectName }).exec()
  return existsProject
}

const projectRepository = {
  create,
  list,
  exists,
}

export default projectRepository
