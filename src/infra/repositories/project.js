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
    members: issuer.sub,
  })
    .lean()
    .exec()
  return projects
}

/** @param {string} projectName */
const exists = async (projectName) => {
  const existsProject = await Project.exists({ name: projectName }).exec()
  return existsProject
}

/**  @param {string} projectName  */
const getByName = async (projectName) => {
  const project = await Project.findOne({ name: projectName }).lean().exec()
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
  )
    .lean()
    .exec()

  return project
}

/** @param {string} orgId */
const getByOrgId = async (orgId) => {
  const project = await Project.findOne({ 'createdBy.organizationId': orgId })
    .lean()
    .exec()

  return project
}

const addMember = async (id, member) => {
  const updatedProject = await Project.findOneAndUpdate(
    { _id: id },
    {
      $push: {
        members: member,
      },
    },
    { new: true }
  )
    .lean()
    .exec()
  return updatedProject
}

const projectRepository = {
  create,
  list,
  exists,
  getByName,
  updateDomains,
  getByOrgId,
  addMember,
}

export default projectRepository
