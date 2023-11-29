import config from '#src/config'
import logger from '#src/domain/logger'
import stripe from '#src/infra/providers/Stripe'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import express from 'express'
const router = express.Router()

router.post('/cron/billing', async (req, res) => {
  const projects = await projectRepository.listProPlan()

  for await (const project of projects) {
    if (!project.subscription) {
      logger.error(
        'failed to update billing quota, project with not subscription',
        { project }
      )
      continue
    }
    const imagesQnty = await imageRepository.countByProject(project.name)

    if (imagesQnty < 1000) {
      logger.warn(
        'failed to update billing quota, project with less then 1000 images',
        { project }
      )
      continue
    }

    const payload = {
      quantity: parseInt(imagesQnty / 1000),
      timestamp: Math.floor(Date.now() / 1000),
      action: 'set',
    }

    const subscriptions = await stripe.subscriptions.retrieve(
      project.subscription
    )

    const proSubscriptionItem = subscriptions.items.data.find(
      (subscriptionItem) => subscriptionItem.price.id === config.STRIPE.PRO_PLAN
    )

    if (!proSubscriptionItem?.id) {
      logger.error(
        'failed to update billing quota, subscription item not found',
        { project }
      )
    }

    await stripe.subscriptionItems.createUsageRecord(
      proSubscriptionItem.id,
      payload
    )

    logger.info('usage record updated successfully', { project, payload })
  }
  return res.send()
})

export default router
