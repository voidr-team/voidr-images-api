import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import HttpException from '#src/domain/exceptions/HttpException'
import { projectConfig } from '#src/models/Project/projectConfig'
import { createProjectSchema, updateProjectDomainsSchema } from './schema'
import auth from '#src/middlewares/auth'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import stripe from '#src/infra/providers/Stripe'
import config from '#src/config'
import axios from 'axios'

const router = express.Router()

router.get('/projects', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  return res.json(project)
})

router.post(
  '/projects',
  auth,
  validateSchema(createProjectSchema),
  async (req, res) => {
    const issuer = getIssuer(req)
    const body = req.body

    if (await projectRepository.exists(body.name)) {
      throw new HttpException(
        422,
        `project with name "${body.name}" already exists`
      )
    }

    const auth0Management = await auth0ManagementFactory()

    const organizationResponse = await auth0Management.createOrganization({
      name: body.name,
      displayName: body.name,
    })

    const organization = organizationResponse?.data

    await auth0Management.addMembersToOrganization(organization.id, [
      issuer.sub,
    ])

    if (body?.referral) {
      axios.post(config.DISCORD.WEBHOOK_REFERRAL, {
        content: `Novo cadastro através de indicação!!!
    
Projeto de indicação:  ${body?.referral}
Novo projeto: ${body?.name}
---------------------------
    `,
      })
    }

    const createdProject = await projectRepository.create(
      {
        organizationId: organization.id,
        sub: issuer.sub,
      },
      {
        name: body.name,
        bucket: {
          source: projectConfig.bucketSource.VOIDR,
          name: 'voidr',
        },
        domains: body.domains,
        members: [issuer.sub],
        referral: body?.referral ?? null,
      }
    )

    return res.json(createdProject)
  }
)

router.post('/projects/join', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  if (project.members.includes(issuer.sub)) {
    return res.status(200).send()
  }
  await projectRepository.addMember(project._id, issuer.sub)
  return res.status(201).send()
})

router.get('/projects', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const projects = await projectRepository.list(issuer)
  return res.json(projects)
})

router.get('/projects/subscription/url', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)

  const customerId = project.customer

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: config.APP_URL,
  })

  return res.json({ url: session.url })
})

router.put(
  '/projects/domains',
  auth,
  validateSchema(updateProjectDomainsSchema),
  async (req, res) => {
    const issuer = getIssuer(req)
    const updatedProject = await projectRepository.updateDomains(
      issuer,
      req.body.domains
    )
    return res.json(updatedProject)
  }
)

router.post('/projects/checkout', auth, async (req, res) => {
  const { token, email, name } = req.body
  const issuer = getIssuer(req)
  const customer = await stripe.customers.create({
    source: token.id,
    email: email,
    name: name,
  })

  const project = await projectRepository.getByOrgId(issuer.organizationId)

  await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: config.STRIPE.PRO_PLAN,
      },
    ],
    currency: 'brl',
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      projectId: String(project._id),
      name: project.name,
    },
  })

  return res.status(200).send()
})

router.post('/projects/plan/upgrade', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: config.STRIPE.PRO_PLAN,
      },
    ],
    currency: 'brl',
    mode: 'subscription',
    success_url: `${config.APP_URL}/pt-BR/common/billing?checkout=completed`,
    metadata: {
      projectId: String(project._id),
      name: project.name,
    },
  })

  return res.json({
    sessionUrl: session.url,
  })
})

router.post('/projects/plan/enterprise', auth, async (req, res) => {
  const payload = req.auth.payload

  const { organization, sub, user } = payload

  axios.post(config.DISCORD.WEBHOOK_ENTERPRISE_LEAD, {
    content: `Novo lead voidr enterpise!!

name:  ${user?.name}
email: ${user?.email}
id:    ${sub}
organization: ${organization?.name}
---------
`,
  })

  return res.status(200).send()
})

export default router
