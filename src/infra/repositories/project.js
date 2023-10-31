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
    'createdBy.sub': issuer.sub,
  }).exec()
  return projects
}

/** @param {string} projectName */
const exists = async (projectName) => {
  const existsProject = await Project.exists({ name: projectName }).exec()
  return existsProject
}

/**  @param {string} projectName  */
const getByName = async (projectName) => {
  const project = await Project.findOne({ name: projectName }).exec()
  return project
}

/**
 * @param {Issuer} issuer
 * @param {id} id
 * @param {string[]} domains
 */
const updateDomains = async (issuer, id, domains) => {
  const project = await Project.findOneAndUpdate(
    {
      _id: id,
      'createdBy.organizationId': issuer.organizationId,
    },
    {
      domains,
    },
    { new: true }
  ).exec()

  return project
}

const projectRepository = {
  create,
  list,
  exists,
  getByName,
  updateDomains,
}

export default projectRepository
