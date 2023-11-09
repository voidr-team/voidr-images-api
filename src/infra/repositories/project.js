import { Project, ProjectSchema } from '#models/Project'
import { projectConfig } from '#src/models/Project/projectConfig'

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
const updateDomains = async (issuer, domains) => {
  const project = await Project.findOneAndUpdate(
    {
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

/**
 * @param {string} id
 * @param {string} member
 */
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

/** @param {string} id  */
const getById = async (id) => {
  const project = await Project.findById(id).lean().exec()
  return project
}

/**
 * @param {string} id
 * @param {{ plan: projectConfig.plans, subscription: string, customer: string }} plan
 */
const updatePlan = async (id, { plan, subscription, customer }) => {
  const updateProject = await Project.findByIdAndUpdate(
    id,
    { plan, subscription, customer },
    { new: true }
  )
  return updateProject
}

/**
 * @param {string} id
 */
const updateFreePlanExpired = async (id) => {
  const updateProject = await Project.findByIdAndUpdate(
    id,
    { freePlanExpired: true },
    { new: true }
  )
  return updateProject
}

const listProPlan = async () => {
  const proPlanProjects = await Project.find({
    plan: projectConfig.plans.PRO,
  })
    .lean()
    .exec()
  return proPlanProjects
}

const projectRepository = {
  create,
  list,
  exists,
  getByName,
  updateDomains,
  updateFreePlanExpired,
  getByOrgId,
  addMember,
  getById,
  updatePlan,
  listProPlan,
}

export default projectRepository
