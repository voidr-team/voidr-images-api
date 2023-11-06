import config from '#src/config'
import logger from '#src/domain/logger'
import stripe from '#src/infra/providers/Stripe'
import projectRepository from '#src/infra/repositories/project'
import { projectConfig } from '#src/models/Project/projectConfig'
import express from 'express'
const router = express.Router()

const endpointSecret = config.STRIPE.WEBHOOK_SECRET

router.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
    switch (event.type) {
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.completed': {
        const checkoutSessionCompleted = event.data.object
        const projectId = checkoutSessionCompleted.metadata?.projectId

        if (
          checkoutSessionCompleted.payment_status === 'paid' &&
          checkoutSessionCompleted.status === 'complete'
        ) {
          await projectRepository.updatePlan(projectId, projectConfig.plans.PRO)
          logger.info('subscription confirmed', { projectId })
        } else {
          logger.error('subscription failed', {
            projectId,
            checkoutSessionCompleted,
          })
        }
      }
    }
  } catch (err) {
    logger.error(err)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  return res.send()
})

export default router
